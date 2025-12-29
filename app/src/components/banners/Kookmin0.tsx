import type { BannerDesignComponentProps } from "@/types/banner";

// Kookmin0 전용 스타일 맵
const getKookmin0Style = (className: string): React.CSSProperties => {
  const styleMap: Record<string, React.CSSProperties> = {
    st1: {
      fill: "#000",
      fontFamily: "Pretendard-Black-KSCpc-EUC-H, Pretendard",
      fontWeight: 800,
      fontSize: "166.9px",
    },
    st2: {
      fill: "#fff",
      fontFamily: "Pretendard-Black-KSCpc-EUC-H, Pretendard",
      fontWeight: 800,
      fontSize: "78.3px",
    },
    st3: {
      fill: "#fff",
      fontFamily: "Pretendard-Black-KSCpc-EUC-H, Pretendard",
      fontWeight: 800,
      fontSize: "166.9px",
    },
    st5: {
      fill: "#fff",
      fontFamily: "Pretendard-SemiBold-KSCpc-EUC-H, Pretendard",
      fontWeight: 600,
      fontSize: "69.8px",
    },
  };
  return styleMap[className] || {};
};

export function Kookmin0({
  editableAreas,
  values = {},
  className = "",
}: BannerDesignComponentProps) {
  return (
    <svg
      viewBox="0 0 2560 314"
      className={className}
      preserveAspectRatio="none"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        pointerEvents: "none",
        shapeRendering: "geometricPrecision",
        textRendering: "geometricPrecision",
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <defs>
        <style>
          {`.kookmin-st0 {
            fill: #0f3c90;
          }
  
          .kookmin-st4 {
            fill: #c12831;
          }
  
          .kookmin-st6 {
            fill: #006164;
          }
  
          .kookmin-st7 {
            fill: #532382;
          }`}
        </style>
      </defs>
      <g>
        <rect width="2560" height="314" fill="#ffffff" />
        <path className="kookmin-st4" d="M1373,0h1187v314h-1313.5L1373,0Z" />
        <rect className="kookmin-st0" x="30" y="19" width="111" height="104" />
        <rect className="kookmin-st7" x="141" y="19" width="96" height="104" />
        <rect className="kookmin-st6" x="237" y="19" width="114" height="104" />
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
              style={getKookmin0Style(area.className || "")}
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
