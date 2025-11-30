import type { BannerDesignComponentProps } from "@/types/banner";

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
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <defs>
        <style>
          {`.st0 {
            fill: #0f3c90;
          }
  
          .st1, .st2, .st3 {
            font-family: Pretendard-Black-KSCpc-EUC-H, Pretendard;
            font-weight: 800;
          }
  
          .st1, .st3 {
            font-size: 166.9px;
          }
  
          .st4 {
            fill: #c12831;
          }
  
          .st2 {
            font-size: 78.3px;
          }
  
          .st2, .st5, .st3 {
            fill: #fff;
          }
  
          .st5 {
            font-family: Pretendard-SemiBold-KSCpc-EUC-H, Pretendard;
            font-size: 69.8px;
            font-weight: 600;
          }
  
          .st6 {
            fill: #006164;
          }
  
          .st7 {
            fill: #532382;
          }`}
        </style>
      </defs>
      <g>
        <rect width="2560" height="314" fill="#ffffff" />
        <path className="st4" d="M1373,0h1187v314h-1313.5L1373,0Z" />
        <rect className="st0" x="30" y="19" width="111" height="104" />
        <rect className="st7" x="141" y="19" width="96" height="104" />
        <rect className="st6" x="237" y="19" width="114" height="104" />
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
              className={area.className || ""}
              transform={area.transform}
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
