// 편집 가능한 영역 정의
export interface EditableArea {
  id: string;
  name: string; // 영역 이름 (예: "제목", "부제목", "이미지")
  type: "text" | "image" | "custom"; // 편집 타입
  x: number; // x 좌표 (viewBox 기준)
  y: number; // y 좌표 (viewBox 기준)
  width: number; // 너비 (viewBox 기준)
  height: number; // 높이 (viewBox 기준)
  defaultValue?: string; // 기본값
  className?: string; // CSS 클래스명 (SVG 스타일용)
  transform?: string; // SVG transform 속성
}

// 현수막 디자인 컴포넌트 Props
export interface BannerDesignComponentProps {
  editableAreas: EditableArea[];
  values?: Record<string, string>; // 편집 영역별 값
  className?: string;
}

// 현수막 디자인 타입
export interface BannerDesign {
  id: string;
  name: string;
  component: React.ComponentType<BannerDesignComponentProps>; // 디자인 컴포넌트
  width: number; // 실제 현수막 가로 사이즈 (mm)
  height: number; // 실제 현수막 세로 사이즈 (mm)
  viewBox: string; // SVG viewBox (예: "0 0 300 100")
  editableAreas: EditableArea[]; // 편집 가능한 영역 목록
  preview?: string; // 디자인 미리보기 설명 또는 색상 (옵션)
}
