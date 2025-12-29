import { useNavigator } from "@/hooks/useNavigator";
import { STEPS } from "@/config/steps";
import { cn } from "@/utils/cn";
import { NavigatorProvider } from "@/contexts/NavigatorContext";

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
      <div className={cn("flex h-full min-h-screen w-full flex-col")}>
        {children}
      </div>
    </NavigatorProvider>
  );
}
