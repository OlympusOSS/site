import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/logout/iam/route";

describe("/logout/iam GET", () => {
	it("delegates to handleOAuthLogout('iam')", async () => {
		vi.stubGlobal("fetch", vi.fn());
		const req = new NextRequest(new URL("http://localhost:2000/logout/iam"));
		const res = await GET(req);
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toContain("/#playground");
		vi.unstubAllGlobals();
	});
});
