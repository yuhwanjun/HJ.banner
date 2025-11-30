import type { BannerDesign } from "@/types/banner";
import { Kookmin0 } from "@/components/banners/Kookmin0";

// 현수막 디자인 목록
export const BANNER_DESIGNS: BannerDesign[] = [
  {
    id: "design-1",
    name: "국민 0",
    component: Kookmin0,
    width: 2560, // 3000mm = 3m
    height: 314, // 1000mm = 1m
    viewBox: "0 0 2560 314",
    editableAreas: [
      {
        id: "text1",
        name: "텍스트 1",
        type: "text",
        x: 37.3,
        y: 269 - 166.9, // y 좌표에서 폰트 크기만큼 빼서 정렬
        width: 800,
        height: 166.9,
        defaultValue: "발목잡힌 민생입법",
        className: "st1",
        transform: "translate(37.3 269)",
      },
      {
        id: "text2",
        name: "텍스트 2",
        type: "text",
        x: 1368.6,
        y: 269 - 166.9,
        width: 800,
        height: 166.9,
        defaultValue: "일하고 싶습니다",
        className: "st3",
        transform: "translate(1368.6 269)",
      },
      {
        id: "text3",
        name: "텍스트 3",
        type: "text",
        x: 1398.7,
        y: 98.7 - 78.3,
        width: 400,
        height: 78.3,
        defaultValue: "국민의힘",
        className: "st2",
        transform: "translate(1398.7 98.7)",
      },
      {
        id: "text4",
        name: "텍스트 4",
        type: "text",
        x: 42.5,
        y: 98.7 - 78.3,
        width: 400,
        height: 78.3,
        defaultValue: "못참겠다!",
        className: "st2",
        transform: "translate(42.5 98.7)",
      },
      {
        id: "text5",
        name: "텍스트 5",
        type: "text",
        x: 1671.6,
        y: 100.3 - 69.8,
        width: 200,
        height: 69.8,
        defaultValue: "은",
        className: "st5",
        transform: "translate(1671.6 100.3)",
      },
    ],
    preview: "brown-gradient-1",
  },
];
