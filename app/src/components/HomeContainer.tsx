import { Nav } from "@/components/Nav";
import { useNavigatorContext } from "@/contexts/NavigatorContext";
import { getStepByIndex } from "@/config/steps";
import { cn } from "@/utils/cn";
import { BannerProvider } from "@/contexts/BannerContext";
import { useEffect } from "react";

function HomeContent() {
  const navigator = useNavigatorContext();
  const currentStepConfig = getStepByIndex(navigator.currentStep);
  const CurrentComponent = currentStepConfig?.component;

  // Step2 (index 1)를 제외한 모든 페이지에서 스크롤 방지
  const isStep2 = navigator.currentStep === 1;
  // Step4 (index 3)에서는 배경 투명하게
  const isStep4 = navigator.currentStep === 3;

  useEffect(() => {
    if (!isStep2) {
      // 스크롤 방지
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";

      // 터치로 화면을 벗어나는 것 방지 (overscroll-behavior)
      document.body.style.overscrollBehavior = "none";
      document.documentElement.style.overscrollBehavior = "none";
    } else {
      // Step2에서는 스크롤 허용
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
    }

    // Step4에서는 배경 canvas가 있으므로 어두운 배경색 유지
    if (isStep4) {
      document.body.style.backgroundColor = "hsl(222.2, 47%, 6%)";
      document.documentElement.style.backgroundColor = "hsl(222.2, 47%, 6%)";
    } else {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    }

    return () => {
      // cleanup
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, [isStep2, isStep4]);

  return (
    <main
      className={cn(
        "flex h-full w-full flex-1 items-start justify-center",
        !isStep4 && "bg-background",
        "p-4 pb-24 sm:p-6",
        isStep2 ? "overflow-auto" : "overflow-hidden",
      )}
      style={{
        overscrollBehavior: isStep2 ? "auto" : "none",
        touchAction: isStep2 ? "auto" : "pan-y pinch-zoom",
        backgroundColor: isStep4 ? "transparent" : undefined,
      }}
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
