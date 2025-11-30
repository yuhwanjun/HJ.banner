import { useState, useCallback } from "react";

export interface NavigatorOptions {
  initialStep?: number;
  minStep?: number;
  maxStep?: number;
  onStepChange?: (step: number) => void;
}

export interface NavigatorReturn {
  currentStep: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

/**
 * Step 기반 네비게이션을 관리하는 커스텀 훅
 *
 * @param options - 네비게이터 옵션
 * @returns 네비게이션 함수 및 상태
 *
 * @example
 * const navigator = useNavigator({
 *   initialStep: 0,
 *   minStep: 0,
 *   maxStep: 3,
 *   onStepChange: (step) => console.log('Step changed:', step)
 * })
 */
export function useNavigator(options: NavigatorOptions = {}): NavigatorReturn {
  const {
    initialStep = 0,
    minStep = 0,
    maxStep = Infinity,
    onStepChange,
  } = options;

  const [currentStep, setCurrentStep] = useState(initialStep);

  const canGoNext = currentStep < maxStep;
  const canGoPrev = currentStep > minStep;
  const isFirstStep = currentStep === minStep;
  const isLastStep = currentStep === maxStep;

  const next = useCallback(() => {
    if (canGoNext) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, canGoNext, onStepChange]);

  const prev = useCallback(() => {
    if (canGoPrev) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, canGoPrev, onStepChange]);

  const goTo = useCallback(
    (step: number) => {
      if (step >= minStep && step <= maxStep) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [minStep, maxStep, onStepChange],
  );

  return {
    currentStep,
    next,
    prev,
    goTo,
    canGoNext,
    canGoPrev,
    isFirstStep,
    isLastStep,
  };
}
