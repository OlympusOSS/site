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

import { GET } from "@/app/login/iam/route";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
	process.env = { ...ORIGINAL_ENV };
	cookieStoreMock.set.mockClear();
});

afterEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

describe("/login/iam GET", () => {
	it("sets the IAM state cookie and redirects to Hydra", async () => {
		process.env.NODE_ENV = "test";
		const res = await GET();
		expect(cookieStoreMock.set).toHaveBeenCalledTimes(1);
		const [name, value, opts] = cookieStoreMock.set.mock.calls[0];
		expect(name).toBe("oauth_state_iam");
		expect(value).toMatch(/^[0-9a-f]{64}$/);
		expect(opts).toMatchObject({ httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 600 });
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toContain("/oauth2/auth?");
	});

	it("uses secure=true in production", async () => {
		process.env.NODE_ENV = "production";
		await GET();
		expect(cookieStoreMock.set.mock.calls[0][2].secure).toBe(true);
	});
});
