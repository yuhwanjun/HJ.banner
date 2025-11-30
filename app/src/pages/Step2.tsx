import { cn } from "@/utils/cn";
import { BannerPreview } from "@/components/BannerPreview";
import { BANNER_DESIGNS } from "@/config/bannerDesigns";
import { useBannerContext } from "@/contexts/BannerContext";
import { useNavigatorContext } from "@/contexts/NavigatorContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Step2() {
  const { setSelectedDesign, editedValues } = useBannerContext();
  const navigator = useNavigatorContext();

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>현수막 디자인 선택</CardTitle>
          <CardDescription>
            원하는 현수막 디자인을 선택해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 현수막 디자인 그리드 */}
          <div
            className={cn("max-h-[calc(100vh-400px)] overflow-y-auto", "pr-2")}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "hsl(var(--border)) hsl(var(--background))",
            }}
          >
            <div className={cn("grid grid-cols-1 gap-4")}>
              {BANNER_DESIGNS.map((design) => {
                return (
                  <Card
                    key={design.id}
                    className="cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                    onClick={() => {
                      setSelectedDesign(design);
                      navigator.goTo(2);
                    }}
                  >
                    <CardContent className="p-0">
                      <BannerPreview design={design} values={editedValues} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
