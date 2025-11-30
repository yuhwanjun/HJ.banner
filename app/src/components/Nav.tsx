import { useNavigator } from "@/hooks/useNavigator";
import { STEPS } from "@/config/steps";
import { cn } from "@/utils/cn";
import { NavigatorProvider } from "@/contexts/NavigatorContext";
import { Button } from "@/components/ui/button";

interface NavProps {
  children: React.ReactNode;
}

export function Nav({ children }: NavProps) {
  const navigator = useNavigator({
    initialStep: 0,
    minStep: 0,
    maxStep: STEPS.length - 1,
    onStepChange: (step) => {
      console.log("Step changed to:", step);
    },
  });

  return (
    <NavigatorProvider value={navigator}>
      <div className={cn("flex h-full min-h-screen w-full flex-col gap-2")}>
        {children}
        <nav className="bg-background/95 fixed bottom-0 left-0 right-0 z-50 flex w-full flex-col gap-1 border-t p-4 backdrop-blur md:min-w-[280px]">
          {/* Step 인디케이터 */}
          <div
            className={cn(
              "mx-auto flex w-fit max-w-md items-center justify-between",
            )}
          >
            {STEPS.map((step, index) => (
              <div key={step.id} className={cn("flex flex-1 items-center")}>
                <Button
                  onClick={() => navigator.goTo(index)}
                  size="icon"
                  variant={
                    index === navigator.currentStep
                      ? "default"
                      : index < navigator.currentStep
                        ? "secondary"
                        : "outline"
                  }
                  className={cn(
                    "h-7 w-7 rounded-full sm:h-8 sm:w-8",
                    index === navigator.currentStep &&
                      "ring-primary ring-2 ring-offset-2",
                  )}
                >
                  {index + 1}
                </Button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 flex-1 sm:mx-2 sm:h-1",
                      index < navigator.currentStep ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 이전/다음 버튼 */}
          <div
            className={cn(
              "mx-auto flex w-fit max-w-md items-center justify-between gap-3 sm:gap-4",
            )}
          >
            <Button
              onClick={navigator.prev}
              disabled={!navigator.canGoPrev}
              variant="outline"
              className="flex-1"
            >
              이전
            </Button>
            <div
              className={cn("text-muted-foreground px-2 text-sm sm:text-base")}
            >
              {navigator.currentStep + 1} / {STEPS.length}
            </div>
            <Button
              onClick={navigator.next}
              disabled={!navigator.canGoNext}
              className="flex-1"
            >
              다음
            </Button>
          </div>
        </nav>
      </div>
    </NavigatorProvider>
  );
}
