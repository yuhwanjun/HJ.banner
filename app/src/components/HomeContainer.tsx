import { Nav } from "@/components/Nav";
import { useNavigatorContext } from "@/contexts/NavigatorContext";
import { getStepByIndex } from "@/config/steps";
import { cn } from "@/utils/cn";
import { BannerProvider } from "@/contexts/BannerContext";

function HomeContent() {
  const navigator = useNavigatorContext();
  const currentStepConfig = getStepByIndex(navigator.currentStep);
  const CurrentComponent = currentStepConfig?.component;

  return (
    <main
      className={cn(
        "flex h-full w-full flex-1 items-start justify-center overflow-auto",
        "bg-background p-4 pb-24 sm:p-6",
      )}
    >
      <div className="w-full max-w-6xl">
        {CurrentComponent && <CurrentComponent />}
      </div>
    </main>
  );
}

export function HomeContainer() {
  return (
    <BannerProvider>
      <Nav>
        <HomeContent />
      </Nav>
    </BannerProvider>
  );
}
