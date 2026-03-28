import { NextRequest } from "next/server";
import { handleOAuthLogout } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  return handleOAuthLogout(request, "iam");
}
