import { useState, useRef, useEffect } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 카메라 훅
  const {
    isCameraOpen,
    backgroundImage,
    videoRef,
    previewCanvasRef,
    openCamera,
    closeCamera,
    capturePhoto,
    removeBackground,
  } = useCamera();

  // 마우스 드래그로 회전
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  // 전역 마우스 이벤트
  useEffect(() => {
    if (isDragging) {
      // 드래그 중 텍스트 선택 방지
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      document.body.style.cursor = "grabbing";

      const handleGlobalMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        setRotationY((prev) => prev + deltaX * 0.5);
        setRotationX((prev) =>
          Math.max(-30, Math.min(30, prev - deltaY * 0.5)),
        );

        setLastMousePos({ x: e.clientX, y: e.clientY });
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        document.body.style.cursor = "";
      };

      window.addEventListener("mousemove", handleGlobalMouseMove, {
        passive: false,
      });
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("selectstart", (e) => e.preventDefault());

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        document.body.style.cursor = "";
      };
    }
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
    <div className="relative flex min-h-[calc(100vh-200px)] w-full items-center justify-center">
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
            className={cn(
              "relative w-full transition-transform duration-100",
              isDragging ? "cursor-grabbing" : "cursor-grab",
              "select-none",
            )}
            style={{
              transform: `perspective(${perspective}px) translateX(${translateX}px) translateY(${translateY}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scale})`,
              transformStyle: "preserve-3d",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              WebkitTouchCallout: "none",
            }}
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* 현수막 그림자 효과 */}
            <div
              className="absolute inset-0 opacity-20 blur-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 50%)",
                transform: `translateZ(-50px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                transformStyle: "preserve-3d",
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
        {/* 각도 조절 토글 버튼 */}
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

        {/* 카메라 배경 설정 버튼 */}
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
                {/* 수동 조절 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">X축 회전</label>
                      <span className="text-muted-foreground">
                        {rotationX.toFixed(1)}°
                      </span>
                    </div>
                    <Slider
                      value={[rotationX]}
                      onValueChange={(value) => setRotationX(value[0])}
                      min={-30}
                      max={30}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">Y축 회전</label>
                      <span className="text-muted-foreground">
                        {rotationY.toFixed(1)}°
                      </span>
                    </div>
                    <Slider
                      value={[rotationY]}
                      onValueChange={(value) => setRotationY(value[0])}
                      min={-180}
                      max={180}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">X 위치</label>
                      <span className="text-muted-foreground">
                        {translateX.toFixed(0)}px
                      </span>
                    </div>
                    <Slider
                      value={[translateX]}
                      onValueChange={(value) => setTranslateX(value[0])}
                      min={-500}
                      max={500}
                      step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">Y 위치</label>
                      <span className="text-muted-foreground">
                        {translateY.toFixed(0)}px
                      </span>
                    </div>
                    <Slider
                      value={[translateY]}
                      onValueChange={(value) => setTranslateY(value[0])}
                      min={-500}
                      max={500}
                      step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">줌 (Scale)</label>
                      <span className="text-muted-foreground">
                        {(scale * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[scale]}
                      onValueChange={(value) => setScale(value[0])}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">원근감 (POV)</label>
                      <span className="text-muted-foreground">
                        {perspective}px
                      </span>
                    </div>
                    <Slider
                      value={[perspective]}
                      onValueChange={(value) => setPerspective(value[0])}
                      min={500}
                      max={3000}
                      step={100}
                    />
                  </div>
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
            <canvas ref={canvasRef} className="hidden" />
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

      {/* 배경 제거 버튼 (배경이 있을 때만 표시) */}
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
  );
}
