import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "@/app/callback/iam/route";

describe("/callback/iam GET", () => {
	it("returns 400 when the code query param is missing", async () => {
		const res = await GET(new NextRequest(new URL("http://localhost:2000/callback/iam")));
		expect(res.status).toBe(400);
	});
});
