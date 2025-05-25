import { agentApiClient } from "@/lib/openformat";
import dayjs from "dayjs";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { platformId } = await req.json();
  if (!platformId) {
    return NextResponse.json({ error: "Missing platformId" }, { status: 400 });
  }
  const start_date = dayjs().startOf("day").subtract(14, "day").toISOString();
  const end_date = dayjs().endOf("day").toISOString();

  try {
    const url = `/summaries/historical-messages?platform_id=${encodeURIComponent(platformId)}&start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`;
    const response = await agentApiClient.get(url);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      // @ts-expect-error: error.response is present on Axios errors
      return NextResponse.json({ error: error.response.data }, { status: 500 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
