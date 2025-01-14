"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  ssr: false,
});

export function Video({ video }: { video: string }) {
  const [loading, setLoading] = useState(true);
  const playerRef = useRef(null);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden" ref={playerRef}>
      {loading && <Skeleton className="w-full h-full" />}
      <ReactPlayer
        url={video}
        loop
        muted
        autoPlay
        playing={true}
        width="100%"
        height="100%"
        onReady={() => setLoading(false)}
      />
    </div>
  );
}
