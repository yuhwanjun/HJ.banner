import { useState, useEffect } from "react";
import { BannerPreview } from "@/components/BannerPreview";
import { useBannerContext } from "@/contexts/BannerContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Step3() {
  const { selectedDesign, updateValue } = useBannerContext();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  // 선택된 디자인이 없으면 Step2로 돌아가야 함
  useEffect(() => {
    if (!selectedDesign) {
      return;
    }

    // 초기값 설정 (defaultValue 사용)
    const initialValues: Record<string, string> = {};
    selectedDesign.editableAreas.forEach((area) => {
      if (area.defaultValue) {
        initialValues[area.id] = area.defaultValue;
      }
    });
    setLocalValues(initialValues);
  }, [selectedDesign]);

  const handleValueChange = (areaId: string, value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [areaId]: value,
    }));
    updateValue(areaId, value);
  };

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
    <div className="w-full space-y-6">
      {/* 현수막 미리보기 */}
      <Card>
        <CardHeader>
          <CardTitle>현수막 미리보기</CardTitle>
          <CardDescription>
            편집한 내용이 실시간으로 반영됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden rounded-lg border">
            <BannerPreview design={selectedDesign} values={localValues} />
          </div>
        </CardContent>
      </Card>

      {/* 편집 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>텍스트 편집</CardTitle>
          <CardDescription>
            각 텍스트 영역을 편집할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDesign.editableAreas.map((area) => {
            if (area.type !== "text") return null;

            return (
              <div key={area.id} className="space-y-2">
                <Label htmlFor={area.id}>{area.name}</Label>
                <Input
                  id={area.id}
                  type="text"
                  value={localValues[area.id] || area.defaultValue || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleValueChange(area.id, e.target.value)
                  }
                  placeholder={area.defaultValue || ""}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
