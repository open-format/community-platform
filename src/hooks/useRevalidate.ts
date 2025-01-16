import { revalidate } from "@/lib/openformat";
import { useEffect } from "react";

export function useRevalidate(shouldRevalidate: boolean, interval = 2500, maxCount = 4) {
  useEffect(() => {
    if (!shouldRevalidate) return;

    let revalidateCount = 0;
    const intervalId = setInterval(() => {
      if (revalidateCount < maxCount) {
        revalidate();
        revalidateCount++;
      } else {
        clearInterval(intervalId);
      }
    }, interval);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [shouldRevalidate, interval, maxCount]);
}
