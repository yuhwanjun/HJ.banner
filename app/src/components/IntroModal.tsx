import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface IntroModalProps {
  onClose: () => void;
}

export function IntroModal({ onClose }: IntroModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 마운트 시 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "transition-all duration-300 ease-out",
        isVisible && !isClosing ? "opacity-100" : "opacity-0",
      )}
    >
      {/* 배경 오버레이 - 블러 효과 */}
      <div
        className={cn(
          "absolute inset-0 bg-black/80 backdrop-blur-md",
          "transition-all duration-300",
        )}
        onClick={handleClose}
      />

      {/* 모달 콘텐츠 */}
      <div
        className={cn(
          "relative z-10 mx-4 w-full max-w-lg",
          "transform transition-all duration-300 ease-out",
          isVisible && !isClosing
            ? "translate-y-0 scale-100"
            : "translate-y-8 scale-95",
        )}
      >
        {/* 메인 카드 */}
        <div className="relative overflow-hidden rounded-2xl from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl ring-1 ring-white/10">
          {/* 설명 */}
          <div className="relative mb-8 space-y-4 text-center">
            <p className="text-md leading-relaxed text-slate-300 sm:text-lg">
              명실상부, 자기PR의 시대!
              <br />
              당신의 신념, 분노, 혹은 오늘의 기분을 마음껏 펼쳐보세요.
              <br />
              거리에 화려하게 장식된 현수막을 보며 나도 한번쯤을 꿈꿔보셨나요?
              <br />
              이제 누구나 현수막으로 세상을 향해 외칠 수 있습니다.(적어도
              디지털에선요)
            </p>
            <p className="text-md leading-relaxed text-slate-300 sm:text-lg">
              사실, 누가 보든 말든 상관없잖아요.
              <br />
              중요한 건 내 말이 걸려 있다는 사실이죠.
              <br />
              어차피 보기 싫어도 눈에 걸리면 볼 수 밖에 없어요.
            </p>
            <p className="text-md leading-relaxed text-slate-300 sm:text-lg">
              PR의 꽃은 역시 커리어죠.
              <br />
              커리어는 곧 정체성, 아니면 적어도 장식이 되니까요.
              <br />
              당신의 멋진 이력도 현수막에 꼭 넣어주세요!(대단한 커리어가
              필요한가요? 적당히 보기 좋으면 그만이야~)
            </p>
            <p className="text-md leading-relaxed text-slate-300 sm:text-lg">
              좋아요, 이제 당신 차례에요.
              <br />
              멋진 현수막을 만들어 세상에 덮어 씌워보세요.
              <br />
              그럼 시작해봐요!
            </p>
          </div>

          {/* CTA 버튼 */}
          <Button
            onClick={handleClose}
            className={cn(
              "group relative w-full overflow-hidden rounded-xl py-6 text-lg font-semibold",
              "bg-gradient-to-r from-rose-500 to-rose-600",
              "hover:from-rose-400 hover:to-rose-500",
              "shadow-lg shadow-rose-500/25",
              "transition-all duration-200",
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
