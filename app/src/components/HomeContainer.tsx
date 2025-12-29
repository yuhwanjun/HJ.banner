import { Nav } from "@/components/Nav";
import { IntroModal } from "@/components/IntroModal";
import { useNavigatorContext } from "@/contexts/NavigatorContext";
import { getStepByIndex } from "@/config/steps";
import { cn } from "@/utils/cn";
import { BannerProvider } from "@/contexts/BannerContext";
import { useEffect, useState } from "react";

function HomeContent() {
  const navigator = useNavigatorContext();
  const currentStepConfig = getStepByIndex(navigator.currentStep);
  const CurrentComponent = currentStepConfig?.component;

  // Step1 (index 0)은 디자인 선택이므로 스크롤 허용
  const isSelectStep = navigator.currentStep === 0;
  // Step2 (index 1)에서는 배경 투명하게 (미리보기)
  const isPreviewStep = navigator.currentStep === 1;

  useEffect(() => {
    if (!isSelectStep) {
      // 스크롤 방지
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";

      // 터치로 화면을 벗어나는 것 방지 (overscroll-behavior)
      document.body.style.overscrollBehavior = "none";
      document.documentElement.style.overscrollBehavior = "none";
    } else {
      // 디자인 선택 페이지에서는 스크롤 허용
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
    }

    // 미리보기에서는 배경 canvas가 있으므로 어두운 배경색 유지
    if (isPreviewStep) {
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
  }, [isSelectStep, isPreviewStep]);

  return (
    <main
      className={cn(
        "flex h-full w-full flex-1 items-start justify-center",
        !isPreviewStep && "bg-background",
        "p-4 pb-24 sm:p-6",
        isSelectStep ? "overflow-auto" : "overflow-hidden",
      )}
      style={{
        overscrollBehavior: isSelectStep ? "auto" : "none",
        touchAction: isSelectStep ? "auto" : "pan-y pinch-zoom",
        backgroundColor: isPreviewStep ? "transparent" : undefined,
      }}
    >
      <div className="w-full max-w-6xl">
        {CurrentComponent && <CurrentComponent />}
      </div>
    </main>
  );
}

export function HomeContainer() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <BannerProvider>
      <Nav>
        <HomeContent />
      </Nav>
      {showIntro && <IntroModal onClose={() => setShowIntro(false)} />}
    </BannerProvider>
  );
}
