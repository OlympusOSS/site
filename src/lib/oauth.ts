import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

export type OAuthDomain = "ciam" | "iam";

interface DomainConfig {
  hydraUrl: string;
  hydraAdminUrl: string;
  kratosAdminUrl: string;
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
      hydraAdminUrl: process.env.CIAM_HYDRA_ADMIN_URL || "http://localhost:3103",
      kratosAdminUrl: process.env.CIAM_KRATOS_ADMIN_URL || "http://localhost:3101",
      clientId: process.env.CIAM_CLIENT_ID || "site-ciam-client",
      clientSecret: process.env.CIAM_CLIENT_SECRET || "site-ciam-secret",
      sessionCookie: "site_ciam_session",
      stateCookie: "oauth_state_ciam",
      errorPrefix: "ciam",
    };
  }
  return {
    hydraUrl: process.env.IAM_HYDRA_PUBLIC_URL || "http://localhost:4102",
    hydraAdminUrl: process.env.IAM_HYDRA_ADMIN_URL || "http://localhost:4103",
    kratosAdminUrl: process.env.IAM_KRATOS_ADMIN_URL || "http://localhost:4101",
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

// ─── Logout Handler (used by logout routes) ─────────────────────────────────

/**
 * Shared OAuth2 logout handler for both CIAM and IAM domains.
 * Revokes Hydra and Kratos sessions server-side via admin APIs, then clears
 * the local session cookie and redirects home — no browser redirect to Hydra.
 */
export async function handleOAuthLogout(
  request: NextRequest,
  domain: OAuthDomain,
): Promise<NextResponse> {
  const config = getDomainConfig(domain);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2000";

  // Extract subject from session cookie claims
  let subject: string | undefined;
  const sessionCookie = request.cookies.get(config.sessionCookie)?.value;
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      subject = session.claims?.sub;
    } catch {
      // Malformed cookie — proceed without subject
    }
  }

  // Revoke Hydra login sessions, Hydra consent sessions, and Kratos sessions
  // server-side. Non-throwing — errors are logged but do not block logout.
  if (subject) {
    await Promise.allSettled([
      fetch(
        `${config.hydraAdminUrl}/admin/oauth2/auth/sessions/login?subject=${encodeURIComponent(subject)}`,
        { method: "DELETE" },
      ).catch((err) => console.error(`[${domain}] Hydra login session revoke failed:`, err)),
      fetch(
        `${config.hydraAdminUrl}/admin/oauth2/auth/sessions/consent?subject=${encodeURIComponent(subject)}&all=true`,
        { method: "DELETE" },
      ).catch((err) => console.error(`[${domain}] Hydra consent session revoke failed:`, err)),
      fetch(
        `${config.kratosAdminUrl}/admin/identities/${encodeURIComponent(subject)}/sessions`,
        { method: "DELETE" },
      ).catch((err) => console.error(`[${domain}] Kratos session revoke failed:`, err)),
    ]);
  }

  // Clear the local session cookie and redirect home
  const response = NextResponse.redirect(appUrl);
  response.cookies.delete(config.sessionCookie);
  return response;
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
      maxAge: parseInt(process.env.SESSION_TTL_SECONDS || "28800", 10),
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
