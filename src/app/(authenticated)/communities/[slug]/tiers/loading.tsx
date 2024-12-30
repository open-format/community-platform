import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoadingTiersPage() {
  return (
    <Card variant="borderless">
      <CardHeader>
        <CardTitle>Tiers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simulate 3 tier form rows */}
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <div className="h-10 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="h-10 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="w-20">
                <div className="h-10 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="w-[70px]">
                <div className="h-10 bg-muted rounded-md animate-pulse" />
              </div>
            </div>
          ))}

          {/* Simulate action buttons */}
          <div className="flex gap-4">
            <div className="w-[100px] h-10 bg-muted rounded-md animate-pulse" />
            <div className="w-[100px] h-10 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
