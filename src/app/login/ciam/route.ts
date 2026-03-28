import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateOAuthState, buildAuthUrl } from "@/lib/oauth";

export async function GET() {
	const state = generateOAuthState();
	const isProduction = process.env.NODE_ENV === "production";

	const cookieStore = await cookies();
	cookieStore.set("oauth_state_ciam", state, {
		httpOnly: true,
		secure: isProduction,
		path: "/",
		maxAge: 600,
		sameSite: "lax",
	});

	const authUrl = buildAuthUrl("ciam", state);
	return NextResponse.redirect(authUrl);
}
