import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "@/app/callback/ciam/route";

describe("/callback/ciam GET", () => {
	it("returns 400 when the code query param is missing", async () => {
		const res = await GET(new NextRequest(new URL("http://localhost:2000/callback/ciam")));
		expect(res.status).toBe(400);
	});
});
