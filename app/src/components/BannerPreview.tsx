import { cn } from "@/utils/cn";
import type { BannerDesign } from "@/types/banner";

interface BannerPreviewProps {
  design: BannerDesign;
  values?: Record<string, string>; // 편집 영역별 값
  className?: string;
}

/**
 * 현수막 미리보기 컴포넌트
 * 실제 사이즈 비율을 유지하면서 w-full로 표시
 */
export function BannerPreview({
  design,
  values,
  className,
}: BannerPreviewProps) {
  // viewBox에서 비율 계산
  const viewBoxValues = design.viewBox.split(/\s+/);
  const viewBoxWidth = parseFloat(viewBoxValues[2] || "0");
  const viewBoxHeight = parseFloat(viewBoxValues[3] || "0");
  const aspectRatio =
    viewBoxWidth > 0 && viewBoxHeight > 0
      ? viewBoxWidth / viewBoxHeight
      : design.width / design.height;

  const DesignComponent = design.component;

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        aspectRatio: aspectRatio.toString(),
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        pointerEvents: "none",
        // 고품질 렌더링을 위한 속성
        imageRendering: "auto",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          pointerEvents: "none",
        }}
      >
        <DesignComponent
          editableAreas={design.editableAreas}
          values={values}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
