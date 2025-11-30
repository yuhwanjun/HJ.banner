import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { BannerPreview } from "@/components/BannerPreview";
import { useBannerContext } from "@/contexts/BannerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils";
import { ChevronUp, ChevronDown, Camera } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";

export function Step4() {
  const { selectedDesign, editedValues } = useBannerContext();
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [perspective, setPerspective] = useState(1000);
  const [isDragging, setIsDragging] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // 카메라 훅
  const {
    isCameraOpen,
    backgroundImage,
    videoRef,
    previewCanvasRef,
    backgroundCanvasRef,
    openCamera,
    closeCamera,
    capturePhoto,
    removeBackground,
  } = useCamera();

  // 성능 최적화: transform 스타일 메모이제이션
  const bannerTransform = useMemo(
    () => ({
      transform: `perspective(${perspective}px) translateX(${translateX}px) translateY(${translateY}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scale})`,
      transformStyle: "preserve-3d" as const,
    }),
    [perspective, translateX, translateY, rotationX, rotationY, scale],
  );

  // 그림자 transform 메모이제이션
  const shadowTransform = useMemo(
    () => ({
      transform: `translateZ(-50px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
      transformStyle: "preserve-3d" as const,
    }),
    [rotationX, rotationY],
  );

  // 마우스 드래그 핸들러 최적화
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // 네이티브 터치 이벤트 리스너 등록 (passive: false로 설정)
  useEffect(() => {
    const element = bannerRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      // cancelable인 경우에만 preventDefault 호출
      if (e.cancelable) {
        e.preventDefault();
      }
      e.stopPropagation();
      if (e.touches.length === 1) {
        setIsDragging(true);
        setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // 드래그 이벤트 처리 최적화
  useEffect(() => {
    if (!isDragging) return;

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.cursor = "grabbing";
    document.body.style.touchAction = "none";

    const handleGlobalMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setRotationY((prev) => prev + deltaX * 0.5);
      setRotationX((prev) => Math.max(-30, Math.min(30, prev - deltaY * 0.5)));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastMousePos.x;
        const deltaY = touch.clientY - lastMousePos.y;

        setRotationY((prev) => prev + deltaX * 0.5);
        setRotationX((prev) =>
          Math.max(-30, Math.min(30, prev - deltaY * 0.5)),
        );
        setLastMousePos({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleGlobalEnd = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.cursor = "";
      document.body.style.touchAction = "";
    };

    const preventSelect = (e: Event) => e.preventDefault();

    window.addEventListener("mousemove", handleGlobalMouseMove, {
      passive: false,
    });
    window.addEventListener("mouseup", handleGlobalEnd);
    window.addEventListener("touchmove", handleGlobalTouchMove, {
      passive: false,
    });
    window.addEventListener("touchend", handleGlobalEnd);
    window.addEventListener("touchcancel", handleGlobalEnd);
    window.addEventListener("selectstart", preventSelect);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalEnd);
      window.removeEventListener("touchcancel", handleGlobalEnd);
      window.removeEventListener("selectstart", preventSelect);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.cursor = "";
      document.body.style.touchAction = "";
    };
  }, [isDragging, lastMousePos]);

  if (!selectedDesign) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">디자인을 선택해주세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* 배경 Canvas */}
      <canvas
        ref={backgroundCanvasRef}
        className="fixed inset-0 z-0"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          willChange: backgroundImage ? "contents" : "auto",
          backgroundColor: "hsl(222.2, 47%, 6%)", // 배경이 없을 때 어두운 배경
        }}
      />
      <div className="relative z-10 flex min-h-[calc(100vh-200px)] w-full items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          {/* 3D 현수막 뷰어 */}
          <div
            ref={containerRef}
            className="relative w-full"
            style={{
              perspective: `${perspective}px`,
              perspectiveOrigin: "center center",
            }}
          >
            <div
              ref={bannerRef}
              className={cn(
                "relative w-full transition-transform duration-100",
                isDragging ? "cursor-grabbing" : "cursor-grab",
                "select-none",
              )}
              style={{
                ...bannerTransform,
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                WebkitTouchCallout: "none",
                touchAction: "none",
                willChange: isDragging ? "transform" : "auto",
              }}
              onMouseDown={handleMouseDown}
              onDragStart={(e) => {
                if (e.cancelable) {
                  e.preventDefault();
                }
              }}
              onContextMenu={(e) => {
                if (e.cancelable) {
                  e.preventDefault();
                }
              }}
            >
              {/* 현수막 그림자 효과 */}
              <div
                className="absolute inset-0 opacity-20 blur-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 50%)",
                  ...shadowTransform,
                }}
              />

              {/* 현수막 */}
              <div
                className="relative"
                style={{
                  transform: "translateZ(0)",
                  transformStyle: "preserve-3d",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  pointerEvents: "none",
                }}
              >
                <BannerPreview design={selectedDesign} values={editedValues} />
              </div>
            </div>
          </div>
        </div>

        {/* 토글 버튼들 - Fixed (nav 위) */}
        <div className="fixed bottom-28 left-1/2 z-50 flex -translate-x-1/2 gap-2">
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="h-12 w-12 rounded-full shadow-lg"
          >
            {isControlsOpen ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant={backgroundImage ? "default" : "outline"}
            size="icon"
            onClick={openCamera}
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <Camera className="h-5 w-5" />
          </Button>
        </div>

        {/* 각도 조절 컨트롤 - Fixed */}
        <div
          className={cn(
            "fixed bottom-28 left-0 right-0 z-40 transition-transform duration-300",
            isControlsOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="mx-auto max-w-6xl px-4 pb-16">
            <Card>
              {isControlsOpen && (
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <SliderControl
                      label="X축 회전"
                      value={rotationX}
                      onChange={setRotationX}
                      min={-30}
                      max={30}
                      step={1}
                      unit="°"
                    />
                    <SliderControl
                      label="Y축 회전"
                      value={rotationY}
                      onChange={setRotationY}
                      min={-180}
                      max={180}
                      step={1}
                      unit="°"
                    />
                    <SliderControl
                      label="X 위치"
                      value={translateX}
                      onChange={setTranslateX}
                      min={-500}
                      max={500}
                      step={10}
                      unit="px"
                      decimals={0}
                    />
                    <SliderControl
                      label="Y 위치"
                      value={translateY}
                      onChange={setTranslateY}
                      min={-500}
                      max={500}
                      step={10}
                      unit="px"
                      decimals={0}
                    />
                    <SliderControl
                      label="줌 (Scale)"
                      value={scale}
                      onChange={setScale}
                      min={0.5}
                      max={2}
                      step={0.1}
                      unit="%"
                      multiplier={100}
                      decimals={0}
                    />
                    <SliderControl
                      label="원근감 (POV)"
                      value={perspective}
                      onChange={setPerspective}
                      min={500}
                      max={3000}
                      step={100}
                      unit="px"
                      decimals={0}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* 카메라 다이얼로그 */}
        <Dialog open={isCameraOpen} onOpenChange={closeCamera}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>배경 사진 촬영</DialogTitle>
              <DialogDescription>
                카메라로 배경 사진을 찍어주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="hidden"
                />
                <canvas
                  ref={previewCanvasRef}
                  className="h-full w-full"
                  style={{ display: "block" }}
                />
                {!videoRef.current?.srcObject && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    카메라를 불러오는 중...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  사진 촬영
                </Button>
                <Button
                  variant="outline"
                  onClick={closeCamera}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 배경 제거 버튼 */}
        {backgroundImage && (
          <Button
            variant="destructive"
            size="sm"
            onClick={removeBackground}
            className="fixed right-4 top-4 z-50"
          >
            배경 제거
          </Button>
        )}
      </div>
    </>
  );
}

// 슬라이더 컨트롤 컴포넌트 분리로 리렌더링 최적화
interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  multiplier?: number;
  decimals?: number;
}

function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
  multiplier = 1,
  decimals = 1,
}: SliderControlProps) {
  const displayValue = (value * multiplier).toFixed(decimals);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <label className="text-foreground font-semibold">{label}</label>
        <span className="text-foreground/90 font-medium">
          {displayValue}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}
