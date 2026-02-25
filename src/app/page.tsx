import { cookies } from "next/headers";
import {
	AuthCard,
	LoginButton,
	DemoStatusBadge as StatusBadge,
} from "@olympusoss/canvas";
import { SessionDisplay } from "@olympusoss/canvas";
import { AnimatedBackground } from "@olympusoss/canvas";
import { PageShell } from "@olympusoss/canvas";

interface TokenData {
	access_token: string;
	id_token: string;
	refresh_token?: string;
	token_type: string;
	expires_in: number;
	scope: string;
	claims: {
		sub: string;
		email?: string;
		[key: string]: unknown;
	};
}

export default async function HomePage() {
	const cookieStore = await cookies();

	let ciamData: TokenData | null = null;
	let iamData: TokenData | null = null;

	const ciamCookie = cookieStore.get("demo_ciam_session");
	if (ciamCookie) {
		try {
			ciamData = JSON.parse(ciamCookie.value);
		} catch {}
	}

	const iamCookie = cookieStore.get("demo_iam_session");
	if (iamCookie) {
		try {
			iamData = JSON.parse(iamCookie.value);
		} catch {}
	}

	const ciamHydraUrl =
		process.env.NEXT_PUBLIC_CIAM_HYDRA_URL || "http://localhost:3102";
	const iamHydraUrl =
		process.env.NEXT_PUBLIC_IAM_HYDRA_URL || "http://localhost:4102";
	const ciamClientId = process.env.CIAM_CLIENT_ID || "demo-ciam-client";
	const iamClientId = process.env.IAM_CLIENT_ID || "demo-iam-client";
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2000";

	const ciamAuthUrl = `${ciamHydraUrl}/oauth2/auth?client_id=${ciamClientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(`${appUrl}/callback/ciam`)}&state=ciam-demo`;
	const iamAuthUrl = `${iamHydraUrl}/oauth2/auth?client_id=${iamClientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(`${appUrl}/callback/iam`)}&state=iam-demo`;

	return (
		<div className="relative min-h-screen px-6 py-12 sm:py-16">
			<AnimatedBackground />

			<div className="relative mx-auto max-w-[960px]">
				{/* Header */}
				<PageShell>
					{/* Auth Cards */}
					<div className="grid gap-6 sm:grid-cols-2">
						<AuthCard
							icon="C"
							iconBg="#6366f1"
							title="Customer Identity (CIAM)"
							description="Authenticate as a customer through CIAM Hydra (port 3102) → CIAM Hera (port 3001)"
							index={0}
						>
							{ciamData ? (
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<StatusBadge
											label="Authenticated"
											bg="#059669"
										/>
										<a
											href="/logout/ciam"
											className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400 no-underline transition-colors hover:bg-red-600/30"
										>
											Logout
										</a>
									</div>
									<SessionDisplay data={ciamData} />
								</div>
							) : (
								<LoginButton href={ciamAuthUrl} bg="#6366f1">
									Login to CIAM
								</LoginButton>
							)}
						</AuthCard>

						<AuthCard
							icon="E"
							iconBg="#f59e0b"
							title="Employee Identity (IAM)"
							description="Authenticate as an employee through IAM Hydra (port 4102) → IAM Hera (port 4001)"
							index={1}
						>
							{iamData ? (
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<StatusBadge
											label="Authenticated"
											bg="#059669"
										/>
										<a
											href="/logout/iam"
											className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400 no-underline transition-colors hover:bg-red-600/30"
										>
											Logout
										</a>
									</div>
									<SessionDisplay data={iamData} />
								</div>
							) : (
								<LoginButton
									href={iamAuthUrl}
									bg="#f59e0b"
									textColor="#0f172a"
								>
									Login to IAM
								</LoginButton>
							)}
						</AuthCard>
					</div>

					{/* Explanation */}
					<p className="mt-6 text-center text-[13px] leading-relaxed text-slate-500">
						This demo app is an OAuth2 client that tests the full
						authorization code flow. Each login button redirects to
						Ory Hydra, which routes through Hera before returning
						here with an authorization code.
					</p>

					{/* Admin Panels */}
					<div className="mt-12">
						<h2 className="mb-6 text-center text-lg font-semibold text-slate-400">
							Admin Panels
						</h2>
						<div className="grid gap-6 sm:grid-cols-2">
							<AuthCard
								icon="A"
								iconBg="#dc2626"
								title="CIAM Admin"
								description="Admin panel for managing customer identities, schemas, and OAuth2 clients on the CIAM domain."
								index={2}
							>
								<LoginButton
									href="http://localhost:3003"
									bg="#dc2626"
								>
									Open CIAM Admin
								</LoginButton>
							</AuthCard>

							<AuthCard
								icon="A"
								iconBg="#059669"
								title="IAM Admin"
								description="Admin panel for managing employee identities, schemas, and OAuth2 clients on the IAM domain."
								index={3}
							>
								<LoginButton
									href="http://localhost:4003"
									bg="#059669"
								>
									Open IAM Admin
								</LoginButton>
							</AuthCard>
						</div>
					</div>
				</PageShell>
			</div>
		</div>
	);
}
