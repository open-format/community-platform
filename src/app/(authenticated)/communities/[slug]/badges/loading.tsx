import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Badges</CardTitle>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="mt-5">
                <AspectRatio ratio={1 / 1.2} className="bg-muted rounded-md">
                  <Skeleton className="h-full w-full rounded-md" />
                </AspectRatio>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-4">
                <div className="flex justify-between items-center w-full">
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
