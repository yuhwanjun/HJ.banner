/**
 * 4개의 코너 포인트를 기반으로 CSS matrix3d 변환을 계산합니다.
 * 원본 직사각형을 임의의 사각형으로 변환하는 원근 변환을 생성합니다.
 */

export interface Point {
  x: number;
  y: number;
}

export interface CornerPoints {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

/**
 * 4x4 행렬 곱셈
 */
function multiplyMatrices(a: number[], b: number[]): number[] {
  const result = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
      }
    }
  }
  return result;
}

/**
 * 행렬식 계산 (3x3)
 */
function det3(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
): number {
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

/**
 * 원점 기준 사각형에서 목표 사각형으로의 원근 변환 행렬을 계산합니다.
 * 8-point algorithm을 사용합니다.
 */
function computeProjectiveTransform(
  srcWidth: number,
  srcHeight: number,
  dst: CornerPoints,
): number[] {
  // 원본 좌표 (직사각형)
  const x0 = 0,
    y0 = 0; // top-left
  const x1 = srcWidth,
    y1 = 0; // top-right
  const x2 = srcWidth,
    y2 = srcHeight; // bottom-right
  const x3 = 0,
    y3 = srcHeight; // bottom-left

  // 목표 좌표
  const u0 = dst.topLeft.x,
    v0 = dst.topLeft.y;
  const u1 = dst.topRight.x,
    v1 = dst.topRight.y;
  const u2 = dst.bottomRight.x,
    v2 = dst.bottomRight.y;
  const u3 = dst.bottomLeft.x,
    v3 = dst.bottomLeft.y;

  // 8x8 행렬을 풀어서 원근 변환 매개변수를 구합니다
  // 간소화된 직접 계산 방법 사용

  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;

  const du1 = u1 - u2;
  const du2 = u3 - u2;
  const du3 = u0 - u1 + u2 - u3;
  const dv1 = v1 - v2;
  const dv2 = v3 - v2;
  const dv3 = v0 - v1 + v2 - v3;

  // 원근 매개변수 계산
  const det = du1 * dv2 - dv1 * du2;
  if (Math.abs(det) < 1e-10) {
    // 퇴화 케이스: 아핀 변환으로 대체
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  const g = (du3 * dv2 - dv3 * du2) / det;
  const h = (du1 * dv3 - dv1 * du3) / det;

  const a = u1 - u0 + g * u1;
  const b = u3 - u0 + h * u3;
  const c = u0;
  const d = v1 - v0 + g * v1;
  const e = v3 - v0 + h * v3;
  const f = v0;

  // 원본을 단위 정사각형으로 정규화한 후 변환
  const sx = 1 / srcWidth;
  const sy = 1 / srcHeight;

  // CSS matrix3d 형식으로 변환
  // matrix3d는 열 우선(column-major) 순서입니다
  const matrix3d: number[] = [
    a * sx,
    d * sx,
    0,
    g * sx,
    b * sy,
    e * sy,
    0,
    h * sy,
    0,
    0,
    1,
    0,
    c,
    f,
    0,
    1,
  ];

  return matrix3d;
}

/**
 * 코너 포인트에서 CSS matrix3d 문자열을 생성합니다.
 */
export function getMatrix3dFromCorners(
  width: number,
  height: number,
  corners: CornerPoints,
): string {
  const matrix = computeProjectiveTransform(width, height, corners);
  return `matrix3d(${matrix.join(",")})`;
}

/**
 * 기본 코너 위치를 생성합니다 (변환 없는 직사각형).
 */
export function getDefaultCorners(width: number, height: number): CornerPoints {
  return {
    topLeft: { x: 0, y: 0 },
    topRight: { x: width, y: 0 },
    bottomLeft: { x: 0, y: height },
    bottomRight: { x: width, y: height },
  };
}

/**
 * 코너를 중심 기준 상대 좌표로 변환합니다.
 */
export function cornersToRelative(
  corners: CornerPoints,
  width: number,
  height: number,
): CornerPoints {
  const cx = width / 2;
  const cy = height / 2;
  return {
    topLeft: { x: corners.topLeft.x - cx, y: corners.topLeft.y - cy },
    topRight: { x: corners.topRight.x - cx, y: corners.topRight.y - cy },
    bottomLeft: { x: corners.bottomLeft.x - cx, y: corners.bottomLeft.y - cy },
    bottomRight: {
      x: corners.bottomRight.x - cx,
      y: corners.bottomRight.y - cy,
    },
  };
}

/**
 * 코너를 픽셀 오프셋에서 백분율로 변환합니다.
 */
export function cornersToPercent(
  corners: CornerPoints,
  width: number,
  height: number,
): CornerPoints {
  return {
    topLeft: {
      x: (corners.topLeft.x / width) * 100,
      y: (corners.topLeft.y / height) * 100,
    },
    topRight: {
      x: (corners.topRight.x / width) * 100,
      y: (corners.topRight.y / height) * 100,
    },
    bottomLeft: {
      x: (corners.bottomLeft.x / width) * 100,
      y: (corners.bottomLeft.y / height) * 100,
    },
    bottomRight: {
      x: (corners.bottomRight.x / width) * 100,
      y: (corners.bottomRight.y / height) * 100,
    },
  };
}
