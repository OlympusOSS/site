import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

export type OAuthDomain = "ciam" | "iam";

interface DomainConfig {
  hydraUrl: string;
  clientId: string;
  clientSecret: string;
  sessionCookie: string;
  stateCookie: string;
  errorPrefix: string;
}

// ─── Domain Configuration ────────────────────────────────────────────────────

function getDomainConfig(domain: OAuthDomain): DomainConfig {
  if (domain === "ciam") {
    return {
      hydraUrl: process.env.CIAM_HYDRA_PUBLIC_URL || "http://localhost:3102",
      clientId: process.env.CIAM_CLIENT_ID || "site-ciam-client",
      clientSecret: process.env.CIAM_CLIENT_SECRET || "site-ciam-secret",
      sessionCookie: "site_ciam_session",
      stateCookie: "oauth_state_ciam",
      errorPrefix: "ciam",
    };
  }
  return {
    hydraUrl: process.env.IAM_HYDRA_PUBLIC_URL || "http://localhost:4102",
    clientId: process.env.IAM_CLIENT_ID || "site-iam-client",
    clientSecret: process.env.IAM_CLIENT_SECRET || "site-iam-secret",
    sessionCookie: "site_iam_session",
    stateCookie: "oauth_state_iam",
    errorPrefix: "iam",
  };
}

// ─── State Generation (used by page.tsx) ─────────────────────────────────────

/**
 * Generate a cryptographically random state string for OAuth2 CSRF protection.
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Build the full OAuth2 authorization URL for a given domain.
 */
export function buildAuthUrl(
  domain: OAuthDomain,
  state: string,
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2000";
  const hydraUrl =
    domain === "ciam"
      ? process.env.NEXT_PUBLIC_CIAM_HYDRA_URL || "http://localhost:3102"
      : process.env.NEXT_PUBLIC_IAM_HYDRA_URL || "http://localhost:4102";
  const clientId =
    domain === "ciam"
      ? process.env.CIAM_CLIENT_ID || "site-ciam-client"
      : process.env.IAM_CLIENT_ID || "site-iam-client";

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid profile email",
    redirect_uri: `${appUrl}/callback/${domain}`,
    state,
  });

  return `${hydraUrl}/oauth2/auth?${params.toString()}`;
}

// ─── Callback Handler (used by callback routes) ─────────────────────────────

/**
 * Shared OAuth2 callback handler for both CIAM and IAM domains.
 * Validates state, exchanges code for tokens, and sets a secure session cookie.
 */
export async function handleOAuthCallback(
  request: NextRequest,
  domain: OAuthDomain,
): Promise<NextResponse> {
  const config = getDomainConfig(domain);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2000";
  const redirectUri = `${appUrl}/callback/${domain}`;

  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 },
    );
  }

  // ── State validation (CSRF protection) ──────────────────────────────────
  const storedState = request.cookies.get(config.stateCookie)?.value;

  if (!storedState || !returnedState || storedState !== returnedState) {
    console.error(
      `${config.errorPrefix.toUpperCase()} OAuth state mismatch — possible CSRF attack`,
    );
    return NextResponse.redirect(
      new URL(`/?error=${config.errorPrefix}_state_mismatch`, appUrl),
    );
  }

  try {
    // ── Token exchange ────────────────────────────────────────────────────
    const tokenRes = await fetch(`${config.hydraUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const error = await tokenRes.text();
      console.error(`${config.errorPrefix.toUpperCase()} token exchange failed:`, error);
      return NextResponse.redirect(
        new URL(`/?error=${config.errorPrefix}_token_exchange_failed`, appUrl),
      );
    }

    const tokens = await tokenRes.json();

    // ── Decode ID token claims ────────────────────────────────────────────
    let claims: Record<string, unknown> = {};
    if (tokens.id_token) {
      const parts = tokens.id_token.split(".");
      if (parts.length === 3) {
        claims = JSON.parse(
          Buffer.from(parts[1], "base64url").toString("utf-8"),
        );
      }
    }

    const sessionData = {
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      claims,
    };

    // ── Set secure session cookie & clean up state cookie ─────────────────
    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.redirect(new URL("/", appUrl));

    response.cookies.set(config.sessionCookie, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: isProduction,
      path: "/",
      maxAge: tokens.expires_in || 3600,
      sameSite: "lax",
    });

    // Delete the one-time state cookie
    response.cookies.set(config.stateCookie, "", {
      httpOnly: true,
      secure: isProduction,
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error(`${config.errorPrefix.toUpperCase()} callback error:`, err);
    return NextResponse.redirect(
      new URL(`/?error=${config.errorPrefix}_callback_failed`, appUrl),
    );
  }
}
