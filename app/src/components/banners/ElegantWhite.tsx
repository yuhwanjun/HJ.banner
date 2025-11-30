import type { BannerDesignComponentProps } from "@/types/banner";

export function ElegantWhite({
  editableAreas,
  values = {},
  className = "",
}: BannerDesignComponentProps) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      {/* 배경 */}
      <rect width="100%" height="100%" fill="#ffffff" />

      {/* 편집 가능한 영역들 */}
      {editableAreas.map((area) => {
        const value = values[area.id] || area.defaultValue || "";
        return (
          <g key={area.id}>
            {/* 텍스트 영역 */}
            {area.type === "text" && (
              <text
                x={area.x + area.width / 2}
                y={area.y + area.height / 2}
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#92400e"
                fontSize={area.height * 0.4}
                fontFamily="Arial"
              >
                {value || area.name}
              </text>
            )}
            {/* 이미지 영역 */}
            {area.type === "image" && value && (
              <image
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                href={value}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
