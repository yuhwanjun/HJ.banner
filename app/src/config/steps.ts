import { ListPage } from "@/pages/ListPage";
import { EditPage } from "@/pages/EditPage";

/**
 * Step 정의 타입
 */
export interface StepConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

/**
 * Step 목록 정의
 * 여기에 각 step의 정보와 컴포넌트를 등록합니다.
 */
export const STEPS: StepConfig[] = [
  {
    id: "select",
    title: "디자인 선택",
    component: ListPage,
  },
  {
    id: "preview",
    title: "미리보기",
    component: EditPage,
  },
];

/**
 * Step ID로 StepConfig를 찾는 헬퍼 함수
 */
export function getStepById(id: string): StepConfig | undefined {
  return STEPS.find((step) => step.id === id);
}

/**
 * Step 인덱스로 StepConfig를 찾는 헬퍼 함수
 */
export function getStepByIndex(index: number): StepConfig | undefined {
  return STEPS[index];
}
