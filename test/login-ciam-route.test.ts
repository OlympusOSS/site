import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStoreMock } = vi.hoisted(() => {
	return {
		cookieStoreMock: {
			set: vi.fn(),
		},
	};
});

vi.mock("next/headers", () => ({
	cookies: async () => cookieStoreMock,
}));

import { GET } from "@/app/login/ciam/route";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
	process.env = { ...ORIGINAL_ENV };
	cookieStoreMock.set.mockClear();
});

afterEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

describe("/login/ciam GET", () => {
	it("sets the CIAM state cookie with secure=false outside production and redirects to Hydra", async () => {
		process.env.NODE_ENV = "test";
		const res = await GET();
		expect(cookieStoreMock.set).toHaveBeenCalledTimes(1);
		const [name, value, opts] = cookieStoreMock.set.mock.calls[0];
		expect(name).toBe("oauth_state_ciam");
		expect(typeof value).toBe("string");
		expect(value.length).toBe(64);
		expect(opts).toMatchObject({ httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 600 });
		expect(res.status).toBe(307);
		const location = res.headers.get("location") ?? "";
		expect(location).toContain("/oauth2/auth?");
		expect(location).toContain("state=");
	});

	it("uses secure=true when NODE_ENV is production", async () => {
		process.env.NODE_ENV = "production";
		await GET();
		const [, , opts] = cookieStoreMock.set.mock.calls[0];
		expect(opts.secure).toBe(true);
	});
});
