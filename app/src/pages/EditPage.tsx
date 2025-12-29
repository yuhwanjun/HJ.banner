import { useState, useEffect } from "react";
import { PerspectiveWarpBanner } from "@/components/PerspectiveWarpBanner";
import { useBannerContext } from "@/contexts/BannerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils";
import { Camera, List, Pencil, X } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { useNavigatorContext } from "@/contexts/NavigatorContext";

export function EditPage() {
  const { selectedDesign, editedValues, updateValue } = useBannerContext();
  const navigator = useNavigatorContext();
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

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

  // 초기값 설정
  useEffect(() => {
    if (!selectedDesign) return;

    const initialValues: Record<string, string> = {};
    selectedDesign.editableAreas.forEach((area) => {
      // editedValues에 키가 존재하면 (빈 문자열이라도) 그 값을 사용
      if (area.id in editedValues) {
        initialValues[area.id] = editedValues[area.id];
      } else if (area.defaultValue) {
        initialValues[area.id] = area.defaultValue;
      }
    });
    setLocalValues(initialValues);
  }, [selectedDesign, editedValues]);

  const handleValueChange = (areaId: string, value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [areaId]: value,
    }));
    updateValue(areaId, value);
  };

  if (!selectedDesign) {
    return (
      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">디자인을 선택해주세요.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* 배경 Canvas - fixed 전체 화면 */}
      <canvas
        ref={backgroundCanvasRef}
        className="fixed inset-0 z-0"
        style={{
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          willChange: backgroundImage ? "contents" : "auto",
          backgroundColor: "hsl(222.2, 47%, 6%)",
        }}
      />

      {/* 현수막 편집 영역 - fixed 전체 화면 */}
      <div className="fixed inset-0 z-10 flex items-center justify-center px-4 pb-32 pt-4">
        <div className="w-full max-w-4xl">
          <PerspectiveWarpBanner design={selectedDesign} values={localValues} />
        </div>
      </div>

      {/* 토글 버튼들 - fixed */}
      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-2">
        {/* 텍스트 편집 토글 버튼 */}
        <Button
          variant={isEditPanelOpen ? "default" : "outline"}
          size="icon"
          onClick={() => setIsEditPanelOpen(!isEditPanelOpen)}
          className="h-12 w-12 rounded-full shadow-lg"
          title="텍스트 편집"
        >
          <Pencil className="h-5 w-5" />
        </Button>

        {/* 리스트로 돌아가기 버튼 */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigator.goTo(0)}
          className="h-12 w-12 rounded-full shadow-lg"
          title="현수막 리스트"
        >
          <List className="h-5 w-5" />
        </Button>

        <Button
          variant={backgroundImage ? "default" : "outline"}
          size="icon"
          onClick={openCamera}
          className="h-12 w-12 rounded-full shadow-lg"
          title="배경 사진 촬영"
        >
          <Camera className="h-5 w-5" />
        </Button>
      </div>

      {/* 텍스트 편집 패널 - fixed */}
      <div
        className={cn(
          "fixed bottom-24 left-0 right-0 z-40 transition-all duration-300",
          isEditPanelOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0",
        )}
      >
        <div className="mx-auto max-w-lg px-4">
          <Card className="relative">
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditPanelOpen(false)}
              className="absolute right-2 top-2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>

            <CardContent className="pt-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                텍스트 편집
              </h3>
              <div className="space-y-4">
                {selectedDesign.editableAreas.map((area) => {
                  if (area.type !== "text") return null;

                  return (
                    <div key={area.id} className="space-y-2">
                      <Label htmlFor={area.id} className="text-sm">
                        {area.name}
                      </Label>
                      <Input
                        id={area.id}
                        type="text"
                        value={
                          area.id in localValues
                            ? localValues[area.id]
                            : area.defaultValue || ""
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleValueChange(area.id, e.target.value)
                        }
                        placeholder={area.defaultValue || ""}
                        className="h-10"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
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

      {/* 배경 제거 버튼 - fixed */}
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
    </>
  );
}

