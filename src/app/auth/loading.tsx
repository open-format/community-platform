import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-1/2 h-1/2 rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
}
