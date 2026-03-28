import { NextRequest } from "next/server";
import { handleOAuthCallback } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  return handleOAuthCallback(request, "iam");
}
