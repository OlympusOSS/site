import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET } from "@/app/health/route";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

describe("/health GET", () => {
	it("returns status: ok and the APP_VERSION when set", async () => {
		process.env.APP_VERSION = "9.9.9";
		const res = await GET();
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ status: "ok", version: "9.9.9" });
	});

	it("falls back to 'unknown' when APP_VERSION is not set", async () => {
		delete process.env.APP_VERSION;
		const res = await GET();
		const body = await res.json();
		expect(body.version).toBe("unknown");
	});
});
