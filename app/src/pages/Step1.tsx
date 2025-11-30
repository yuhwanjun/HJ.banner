import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Step1() {
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Step 1</CardTitle>
          <CardDescription className="text-foreground/80">
            첫 번째 단계입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/70">현수막 제작을 시작하세요.</p>
        </CardContent>
      </Card>
    </div>
  );
}
