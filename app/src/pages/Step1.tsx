import { Card, CardContent } from "@/components/ui/card";

export function Step1() {
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardContent>
          <p className="text-foreground/70">현수막 제작을 시작하세요.</p>
        </CardContent>
      </Card>
    </div>
  );
}
