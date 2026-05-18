import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildAuthUrl, generateOAuthState, handleOAuthCallback, handleOAuthLogout } from "@/lib/oauth";

// Preserve / restore process.env between tests so each branch starts clean.
const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
	process.env = { ...ORIGINAL_ENV };
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("generateOAuthState", () => {
	it("returns a 64-character hex string (32 random bytes)", () => {
		const state = generateOAuthState();
		expect(state).toMatch(/^[0-9a-f]{64}$/);
	});

	it("returns a different value on each call", () => {
		const a = generateOAuthState();
		const b = generateOAuthState();
		expect(a).not.toBe(b);
	});
});

describe("buildAuthUrl", () => {
	it("builds a CIAM auth URL using env overrides", () => {
		process.env.NEXT_PUBLIC_APP_URL = "https://example.test";
		process.env.NEXT_PUBLIC_CIAM_HYDRA_URL = "https://hydra.ciam.test";
		process.env.CIAM_CLIENT_ID = "ciam-client-custom";
		const url = new URL(buildAuthUrl("ciam", "state-abc"));
		expect(url.origin).toBe("https://hydra.ciam.test");
		expect(url.pathname).toBe("/oauth2/auth");
		expect(url.searchParams.get("client_id")).toBe("ciam-client-custom");
		expect(url.searchParams.get("response_type")).toBe("code");
		expect(url.searchParams.get("scope")).toBe("openid profile email");
		expect(url.searchParams.get("redirect_uri")).toBe("https://example.test/callback/ciam");
		expect(url.searchParams.get("state")).toBe("state-abc");
	});

	it("builds a CIAM auth URL using default localhost values", () => {
		// Wipe relevant env so the `||` fallback branches all fire.
		delete process.env.NEXT_PUBLIC_APP_URL;
		delete process.env.NEXT_PUBLIC_CIAM_HYDRA_URL;
		delete process.env.CIAM_CLIENT_ID;
		const url = new URL(buildAuthUrl("ciam", "state-default"));
		expect(url.origin).toBe("http://localhost:3102");
		expect(url.searchParams.get("client_id")).toBe("site-ciam-client");
		expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:2000/callback/ciam");
	});

	it("builds an IAM auth URL using env overrides", () => {
		process.env.NEXT_PUBLIC_APP_URL = "https://app.iam.test";
		process.env.NEXT_PUBLIC_IAM_HYDRA_URL = "https://hydra.iam.test";
		process.env.IAM_CLIENT_ID = "iam-client-custom";
		const url = new URL(buildAuthUrl("iam", "state-iam"));
		expect(url.origin).toBe("https://hydra.iam.test");
		expect(url.searchParams.get("client_id")).toBe("iam-client-custom");
		expect(url.searchParams.get("redirect_uri")).toBe("https://app.iam.test/callback/iam");
	});

	it("builds an IAM auth URL using default localhost values", () => {
		delete process.env.NEXT_PUBLIC_APP_URL;
		delete process.env.NEXT_PUBLIC_IAM_HYDRA_URL;
		delete process.env.IAM_CLIENT_ID;
		const url = new URL(buildAuthUrl("iam", "state-default-iam"));
		expect(url.origin).toBe("http://localhost:4102");
		expect(url.searchParams.get("client_id")).toBe("site-iam-client");
		expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:2000/callback/iam");
	});
});

// Helpers for the route handlers.

function makeLogoutRequest({ domain, cookieValue }: { domain: "ciam" | "iam"; cookieValue?: string }): NextRequest {
	const cookieName = domain === "ciam" ? "site_ciam_session" : "site_iam_session";
	const headers = new Headers();
	if (cookieValue !== undefined) {
		headers.set("cookie", `${cookieName}=${encodeURIComponent(cookieValue)}`);
	}
	return new NextRequest(new URL(`http://localhost:2000/logout/${domain}`), { headers });
}

function makeCallbackRequest({
	domain,
	code,
	state,
	stateCookie,
}: {
	domain: "ciam" | "iam";
	code?: string;
	state?: string;
	stateCookie?: string;
}): NextRequest {
	const url = new URL(`http://localhost:2000/callback/${domain}`);
	if (code !== undefined) url.searchParams.set("code", code);
	if (state !== undefined) url.searchParams.set("state", state);
	const headers = new Headers();
	if (stateCookie !== undefined) {
		const cookieName = domain === "ciam" ? "oauth_state_ciam" : "oauth_state_iam";
		headers.set("cookie", `${cookieName}=${encodeURIComponent(stateCookie)}`);
	}
	return new NextRequest(url, { headers });
}

// Encode a JWT-like base64url payload for the id_token claim parsing branch.
function makeIdToken(claims: Record<string, unknown>): string {
	const head = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
	const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
	return `${head}.${body}.`;
}

describe("handleOAuthLogout", () => {
	it("revokes Hydra and Kratos sessions when a session cookie with a subject is present", async () => {
		const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
		vi.stubGlobal("fetch", fetchMock);

		const session = JSON.stringify({ claims: { sub: "user-1" } });
		const res = await handleOAuthLogout(makeLogoutRequest({ domain: "ciam", cookieValue: session }), "ciam");

		expect(fetchMock).toHaveBeenCalledTimes(3);
		const calledUrls = fetchMock.mock.calls.map(([url]) => url as string);
		expect(calledUrls).toEqual(
			expect.arrayContaining([
				expect.stringContaining("/admin/oauth2/auth/sessions/login?subject=user-1"),
				expect.stringContaining("/admin/oauth2/auth/sessions/consent?subject=user-1"),
				expect.stringContaining("/admin/identities/user-1/sessions"),
			]),
		);
		expect(res.status).toBe(307);
		// Cookie was cleared (deleted) on the response.
		const setCookies = res.headers.getSetCookie?.() ?? [];
		expect(setCookies.some((c) => c.startsWith("site_ciam_session="))).toBe(true);
	});

	it("revokes IAM sessions via the IAM admin URLs", async () => {
		const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
		vi.stubGlobal("fetch", fetchMock);

		const session = JSON.stringify({ claims: { sub: "iam-user" } });
		const res = await handleOAuthLogout(makeLogoutRequest({ domain: "iam", cookieValue: session }), "iam");

		expect(fetchMock).toHaveBeenCalledTimes(3);
		const calledUrls = fetchMock.mock.calls.map(([url]) => url as string);
		// IAM defaults to ports 4101/4103.
		expect(calledUrls.every((u) => u.includes(":4103") || u.includes(":4101"))).toBe(true);
		expect(res.status).toBe(307);
	});

	it("logs and proceeds when revocation fetches reject", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const fetchMock = vi.fn(async () => {
			throw new Error("boom");
		});
		vi.stubGlobal("fetch", fetchMock);

		const session = JSON.stringify({ claims: { sub: "user-err" } });
		const res = await handleOAuthLogout(makeLogoutRequest({ domain: "ciam", cookieValue: session }), "ciam");

		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(errorSpy).toHaveBeenCalledTimes(3);
		expect(res.status).toBe(307);
	});

	it("skips revocation when the session cookie is missing", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		const res = await handleOAuthLogout(makeLogoutRequest({ domain: "ciam" }), "ciam");
		expect(fetchMock).not.toHaveBeenCalled();
		expect(res.status).toBe(307);
	});

	it("skips revocation when the session cookie is malformed JSON", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		const res = await handleOAuthLogout(makeLogoutRequest({ domain: "ciam", cookieValue: "not-json" }), "ciam");
		expect(fetchMock).not.toHaveBeenCalled();
		expect(res.status).toBe(307);
	});

	it("skips revocation when the session payload has no subject claim", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		const res = await handleOAuthLogout(makeLogoutRequest({ domain: "ciam", cookieValue: JSON.stringify({ claims: {} }) }), "ciam");
		expect(fetchMock).not.toHaveBeenCalled();
		expect(res.status).toBe(307);
	});
});

describe("handleOAuthCallback", () => {
	it("returns 400 when the authorization code is missing", async () => {
		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "ciam" }), "ciam");
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body).toEqual({ error: "Missing authorization code" });
	});

	it("redirects with an error when the state cookie is absent", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "ciam", code: "abc", state: "s1" }), "ciam");
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toContain("ciam_state_mismatch");
		expect(errorSpy).toHaveBeenCalled();
	});

	it("redirects with an error when the returned state does not match the cookie", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "iam", code: "abc", state: "wrong", stateCookie: "right" }), "iam");
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toContain("iam_state_mismatch");
	});

	it("redirects with an error when the returned state is missing entirely", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		// `state` query param absent, cookie present → mismatch branch.
		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "ciam", code: "abc", stateCookie: "set" }), "ciam");
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toContain("ciam_state_mismatch");
	});

	it("redirects with token_exchange_failed when Hydra returns non-OK", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const fetchMock = vi.fn(async () => new Response("bad", { status: 400 }));
		vi.stubGlobal("fetch", fetchMock);

		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "ciam", code: "abc", state: "match", stateCookie: "match" }), "ciam");
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toContain("ciam_token_exchange_failed");
		expect(errorSpy).toHaveBeenCalled();
	});

	it("sets a session cookie when the token exchange succeeds and an id_token is returned", async () => {
		const tokenResponse = {
			access_token: "at-1",
			id_token: makeIdToken({ sub: "user-1", email: "a@b.c" }),
			refresh_token: "rt-1",
			token_type: "Bearer",
			expires_in: 3600,
			scope: "openid profile email",
		};
		const fetchMock = vi.fn(async () => new Response(JSON.stringify(tokenResponse), { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);
		process.env.NODE_ENV = "production";
		process.env.SESSION_TTL_SECONDS = "60";

		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "ciam", code: "code-1", state: "state-1", stateCookie: "state-1" }), "ciam");
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toBe("http://localhost:2000/#playground");
		const setCookies = res.headers.getSetCookie?.() ?? [];
		const sessionCookie = setCookies.find((c) => c.startsWith("site_ciam_session="));
		expect(sessionCookie).toBeTruthy();
		expect(sessionCookie).toContain("Secure");
		expect(sessionCookie).toContain("Max-Age=60");
		const stateCookie = setCookies.find((c) => c.startsWith("oauth_state_ciam="));
		expect(stateCookie).toBeTruthy();
		expect(stateCookie).toContain("Max-Age=0");
		// The session JSON inside the cookie carries the decoded claims.
		const value = sessionCookie?.split(";")[0].split("=")[1];
		const decoded = JSON.parse(decodeURIComponent(value ?? ""));
		expect(decoded.claims).toEqual({ sub: "user-1", email: "a@b.c" });
		expect(decoded.access_token).toBe("at-1");
	});

	it("handles a token response with no id_token (claims default to empty)", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(
					JSON.stringify({
						access_token: "at-2",
						token_type: "Bearer",
						expires_in: 60,
						scope: "openid",
					}),
					{ status: 200 },
				),
		);
		vi.stubGlobal("fetch", fetchMock);
		// Not production → secure flag should be false.
		process.env.NODE_ENV = "test";
		// No SESSION_TTL_SECONDS → falls back to default 28800.
		delete process.env.SESSION_TTL_SECONDS;

		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "iam", code: "code-2", state: "s2", stateCookie: "s2" }), "iam");
		expect(res.status).toBe(307);
		const setCookies = res.headers.getSetCookie?.() ?? [];
		const sessionCookie = setCookies.find((c) => c.startsWith("site_iam_session="));
		expect(sessionCookie).toBeTruthy();
		// secure: false → no "Secure" attribute on the cookie.
		expect(sessionCookie).not.toContain("Secure");
		expect(sessionCookie).toContain("Max-Age=28800");
		const decoded = JSON.parse(decodeURIComponent(sessionCookie?.split(";")[0].split("=")[1] ?? ""));
		expect(decoded.claims).toEqual({});
	});

	it("treats a malformed id_token (wrong segment count) as no claims", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(
					JSON.stringify({
						access_token: "at-3",
						// Only two segments → parts.length !== 3 branch.
						id_token: "header.body",
						token_type: "Bearer",
						expires_in: 60,
						scope: "openid",
					}),
					{ status: 200 },
				),
		);
		vi.stubGlobal("fetch", fetchMock);

		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "ciam", code: "code-3", state: "s3", stateCookie: "s3" }), "ciam");
		expect(res.status).toBe(307);
		const setCookies = res.headers.getSetCookie?.() ?? [];
		const sessionCookie = setCookies.find((c) => c.startsWith("site_ciam_session="));
		const decoded = JSON.parse(decodeURIComponent(sessionCookie?.split(";")[0].split("=")[1] ?? ""));
		expect(decoded.claims).toEqual({});
	});

	it("redirects with callback_failed when an exception is thrown during token exchange", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const fetchMock = vi.fn(async () => {
			throw new Error("network down");
		});
		vi.stubGlobal("fetch", fetchMock);

		const res = await handleOAuthCallback(makeCallbackRequest({ domain: "iam", code: "code-x", state: "match", stateCookie: "match" }), "iam");
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toContain("iam_callback_failed");
		expect(errorSpy).toHaveBeenCalled();
	});
});
