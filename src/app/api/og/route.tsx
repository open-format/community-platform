import { getContrastSafeColor } from "@/lib/utils";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") ?? "Community";
    const accent = searchParams.get("accent") ?? "#6366F1";

    // Simple gradient using the accent color (similar to community banner)
    const gradient = `linear-gradient(45deg, ${accent}, ${accent}88)`;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // Align to the left
            justifyContent: "flex-end", // Align to the bottom
            background: gradient,
            fontFamily: "Manrope",
            padding: "48px", // Add some padding
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: getContrastSafeColor(accent),
              textAlign: "left",
              lineHeight: 1.1,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {title}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
