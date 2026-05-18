import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/logout/ciam/route";

describe("/logout/ciam GET", () => {
	it("delegates to handleOAuthLogout('ciam') and returns its redirect", async () => {
		// No fetch is needed because the request lacks a session cookie, so the
		// handler skips revocation entirely.
		const fetchSpy = vi.fn();
		vi.stubGlobal("fetch", fetchSpy);
		const req = new NextRequest(new URL("http://localhost:2000/logout/ciam"));
		const res = await GET(req);
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toContain("/#playground");
		expect(fetchSpy).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});
});
