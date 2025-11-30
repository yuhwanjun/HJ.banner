import type { BannerDesignComponentProps } from "@/types/banner";

// Minju0 전용 스타일 맵
const getMinju0Style = (className: string): React.CSSProperties => {
  const styleMap: Record<string, React.CSSProperties> = {
    st0: {
      fill: "#fff",
      fontFamily: "Pretendard-ExtraBold-KSCpc-EUC-H, Pretendard",
      fontWeight: 700,
      fontSize: "88.5px",
    },
    st1: {
      fill: "#fff",
      fontFamily: "Pretendard-ExtraBold-KSCpc-EUC-H, Pretendard",
      fontWeight: 700,
      fontSize: "393.9px",
    },
    st2: {
      fill: "#fff",
      fontFamily: "Pretendard-ExtraBold-KSCpc-EUC-H, Pretendard",
      fontWeight: 700,
      fontSize: "138px",
    },
    st3: {
      fill: "#fff",
      fontFamily: "Pretendard-ExtraBold-KSCpc-EUC-H, Pretendard",
      fontWeight: 700,
      fontSize: "179.8px",
    },
  };
  return styleMap[className] || {};
};

export function Minju0({
  editableAreas,
  values = {},
  className = "",
}: BannerDesignComponentProps) {
  return (
    <svg
      viewBox="0 0 3840 650"
      className={className}
      preserveAspectRatio="none"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        pointerEvents: "none",
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <defs>
        <style>
          {`.minju-st4 {
            fill: url(#minju-linear-gradient);
          }
    
          .minju-st5 {
            fill: #e10147;
          }`}
        </style>
        <linearGradient
          id="minju-linear-gradient"
          x1="0"
          y1="325"
          x2="3840"
          y2="325"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#073690" />
          <stop offset="1" stopColor="#162870" />
        </linearGradient>
      </defs>
      <g>
        <rect className="minju-st4" width="3840" height="650" />
        <polygon
          className="minju-st5"
          points="3669.2 650 3840 650 3840 479.2 3669.2 650"
        />
      </g>
      <g>
        {editableAreas.map((area) => {
          const value =
            values[area.id] !== undefined
              ? values[area.id]
              : area.defaultValue || "";
          return (
            <text
              key={area.id}
              transform={area.transform}
              style={getMinju0Style(area.className || "")}
            >
              <tspan x="0" y="0">
                {value}
              </tspan>
            </text>
          );
        })}
      </g>
    </svg>
  );
}
