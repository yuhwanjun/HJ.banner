import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { BannerPreview } from "@/components/BannerPreview";
import type { BannerDesign } from "@/types/banner";
import { cn } from "@/utils/cn";
import {
  type CornerPoints,
  type Point,
  getMatrix3dFromCorners,
  getDefaultCorners,
} from "@/utils/perspectiveTransform";

interface PerspectiveWarpBannerProps {
  design: BannerDesign;
  values?: Record<string, string>;
  className?: string;
  onTransformChange?: (corners: CornerPoints) => void;
}

type CornerKey = keyof CornerPoints;

const CORNER_SIZE = 32; // 코너 핸들 크기 (px)
const CORNER_HIT_AREA = 44; // 터치 영역 크기 (px)
const RENDER_SCALE = 4; // 고해상도 렌더링을 위한 스케일 팩터

export function PerspectiveWarpBanner({
  design,
  values,
  className,
  onTransformChange,
}: PerspectiveWarpBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [corners, setCorners] = useState<CornerPoints | null>(null);
  const [draggingCorner, setDraggingCorner] = useState<CornerKey | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // 컨테이너 크기 및 위치 측정
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
      setContainerRect(rect);

      // 초기 코너 설정 (처음 한번만)
      if (!corners) {
        setCorners(getDefaultCorners(rect.width, rect.height));
      }
    };

    updateSize();

    // 스크롤이나 리사이즈 시에도 위치 업데이트
    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      setContainerRect(rect);
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [corners]);

  // 컨테이너 크기 변경 시 코너 비율 유지
  useEffect(() => {
    if (!corners || containerSize.width === 0 || containerSize.height === 0)
      return;

    // 리사이즈 시 코너 위치를 새 크기에 맞게 스케일
    const updateCornersOnResize = () => {
      const newCorners = getDefaultCorners(
        containerSize.width,
        containerSize.height,
      );
      setCorners(newCorners);
    };

    // 첫 로드 이후에만 실행
    const timeoutId = setTimeout(updateCornersOnResize, 100);
    return () => clearTimeout(timeoutId);
  }, [containerSize.width, containerSize.height]);

  // matrix3d 변환 계산
  const transform = useMemo(() => {
    if (!corners || containerSize.width === 0) return "";
    return getMatrix3dFromCorners(
      containerSize.width,
      containerSize.height,
      corners,
    );
  }, [corners, containerSize]);

  // 마우스/터치 드래그 핸들러
  const handleCornerDragStart = useCallback(
    (
      cornerKey: CornerKey,
      clientX: number,
      clientY: number,
      e: React.MouseEvent | React.TouchEvent,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      if (!corners || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const corner = corners[cornerKey];

      // 클릭 지점과 코너 실제 위치의 오프셋 계산
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      setDragOffset({
        x: localX - corner.x,
        y: localY - corner.y,
      });
      setDraggingCorner(cornerKey);
    },
    [corners],
  );

  const handleMouseDown = useCallback(
    (cornerKey: CornerKey) => (e: React.MouseEvent) => {
      handleCornerDragStart(cornerKey, e.clientX, e.clientY, e);
    },
    [handleCornerDragStart],
  );

  const handleTouchStart = useCallback(
    (cornerKey: CornerKey) => (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handleCornerDragStart(
          cornerKey,
          e.touches[0].clientX,
          e.touches[0].clientY,
          e,
        );
      }
    },
    [handleCornerDragStart],
  );

  // 드래그 이벤트 처리
  useEffect(() => {
    if (!draggingCorner || !corners) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const localX = clientX - rect.left - dragOffset.x;
      const localY = clientY - rect.top - dragOffset.y;

      // 화면 전체를 이동 범위로 설정 (컨테이너 기준 상대 좌표)
      const screenLeft = -rect.left;
      const screenTop = -rect.top;
      const screenRight = window.innerWidth - rect.left;
      const screenBottom = window.innerHeight - rect.top;

      const clampedX = Math.max(screenLeft, Math.min(screenRight, localX));
      const clampedY = Math.max(screenTop, Math.min(screenBottom, localY));

      setCorners((prev) => {
        if (!prev) return prev;
        const newCorners = {
          ...prev,
          [draggingCorner]: { x: clampedX, y: clampedY },
        };
        onTransformChange?.(newCorners);
        return newCorners;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setDraggingCorner(null);
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [draggingCorner, corners, dragOffset, containerSize, onTransformChange]);

  // aspect ratio 계산
  const viewBoxValues = design.viewBox.split(/\s+/);
  const viewBoxWidth = parseFloat(viewBoxValues[2] || "0");
  const viewBoxHeight = parseFloat(viewBoxValues[3] || "0");
  const aspectRatio =
    viewBoxWidth > 0 && viewBoxHeight > 0
      ? viewBoxWidth / viewBoxHeight
      : design.width / design.height;

  // 코너 핸들 렌더링 (화면 절대 좌표 사용)
  const renderCornerHandle = (cornerKey: CornerKey, position: Point) => {
    if (!containerRect) return null;
    const rect = containerRect;

    const cornerStyles: Record<CornerKey, string> = {
      topLeft: "cursor-nw-resize",
      topRight: "cursor-ne-resize",
      bottomLeft: "cursor-sw-resize",
      bottomRight: "cursor-se-resize",
    };

    const cornerIcons: Record<CornerKey, string> = {
      topLeft: "↖",
      topRight: "↗",
      bottomLeft: "↙",
      bottomRight: "↘",
    };

    // 컨테이너 기준 좌표를 화면 절대 좌표로 변환
    const screenX = rect.left + position.x;
    const screenY = rect.top + position.y;

    return (
      <div
        key={cornerKey}
        className={cn(
          "fixed z-20 flex items-center justify-center",
          "rounded-full border-2 border-blue-500 bg-white/90 shadow-lg",
          "transition-transform duration-150",
          cornerStyles[cornerKey],
          draggingCorner === cornerKey && "scale-125 bg-blue-100",
        )}
        style={{
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          left: screenX - CORNER_SIZE / 2,
          top: screenY - CORNER_SIZE / 2,
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown(cornerKey)}
        onTouchStart={handleTouchStart(cornerKey)}
      >
        <span className="pointer-events-none select-none text-sm font-bold text-blue-600">
          {cornerIcons[cornerKey]}
        </span>
        {/* 더 큰 터치 영역 */}
        <div
          className="absolute"
          style={{
            width: CORNER_HIT_AREA,
            height: CORNER_HIT_AREA,
            left: (CORNER_SIZE - CORNER_HIT_AREA) / 2,
            top: (CORNER_SIZE - CORNER_HIT_AREA) / 2,
          }}
        />
      </div>
    );
  };

  // 가이드 라인 렌더링
  const renderGuideLines = () => {
    if (!corners || !containerRect) return null;

    const rect = containerRect;
    const points = [
      corners.topLeft,
      corners.topRight,
      corners.bottomRight,
      corners.bottomLeft,
    ];

    // 컨테이너 기준 좌표를 화면 절대 좌표로 변환
    const toScreenCoords = (p: Point) => ({
      x: rect.left + p.x,
      y: rect.top + p.y,
    });

    const screenPoints = points.map(toScreenCoords);

    return (
      <svg
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <polygon
          points={screenPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="rgba(59, 130, 246, 0.5)"
          strokeWidth="2"
          strokeDasharray="8,4"
        />
        {/* 대각선 가이드 */}
        <line
          x1={screenPoints[0].x}
          y1={screenPoints[0].y}
          x2={screenPoints[2].x}
          y2={screenPoints[2].y}
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
        <line
          x1={screenPoints[1].x}
          y1={screenPoints[1].y}
          x2={screenPoints[3].x}
          y2={screenPoints[3].y}
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      </svg>
    );
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* 메인 컨테이너 */}
      <div
        ref={containerRef}
        className="relative w-full overflow-visible"
        style={{
          aspectRatio: aspectRatio.toString(),
        }}
      >
        {/* 가이드 라인 */}
        {renderGuideLines()}

        {/* 변환된 배너 - 고해상도 렌더링 래퍼 */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: transform,
            transformStyle: "preserve-3d",
            willChange: draggingCorner ? "transform" : "auto",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* 고해상도 렌더링 레이어 */}
          <div
            className="absolute origin-top-left"
            style={{
              width: `${100 * RENDER_SCALE}%`,
              height: `${100 * RENDER_SCALE}%`,
              transform: `scale(${1 / RENDER_SCALE})`,
              transformOrigin: "top left",
            }}
          >
            <BannerPreview design={design} values={values} />
          </div>
        </div>

        {/* 코너 핸들 */}
        {corners && (
          <>
            {renderCornerHandle("topLeft", corners.topLeft)}
            {renderCornerHandle("topRight", corners.topRight)}
            {renderCornerHandle("bottomLeft", corners.bottomLeft)}
            {renderCornerHandle("bottomRight", corners.bottomRight)}
          </>
        )}
      </div>
    </div>
  );
}
