import { revalidate } from "@/lib/openformat";
import { useEffect, useState } from "react";

export function useRevalidate(shouldRevalidate: boolean, interval = 1000, maxCount = 30) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!shouldRevalidate) return;

    let revalidateCount = 0;
    setIsLoading(true);

    const intervalId = setInterval(() => {
      if (revalidateCount < maxCount) {
        revalidate();
        revalidateCount++;
      } else {
        clearInterval(intervalId);
        setIsLoading(false);
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
      setIsLoading(false);
    }; // Cleanup on unmount
  }, [shouldRevalidate, interval, maxCount]);

  return { isRevalidating: isLoading };
}
