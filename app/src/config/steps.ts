import { Step1 } from "@/pages/Step1";
import { Step2 } from "@/pages/Step2";
import { Step3 } from "@/pages/Step3";
import { Step4 } from "@/pages/Step4";

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
    id: "step1",
    title: "Step 1",
    component: Step1,
  },
  {
    id: "step2",
    title: "Step 2",
    component: Step2,
  },
  {
    id: "step3",
    title: "Step 3",
    component: Step3,
  },
  {
    id: "step4",
    title: "Step 4",
    component: Step4,
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
