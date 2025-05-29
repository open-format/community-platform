import { agentApiClient } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { did } = await req.json();

  const response = await agentApiClient.post("/users", {
    did: did,
  });

  return NextResponse.json(response.data);
}
