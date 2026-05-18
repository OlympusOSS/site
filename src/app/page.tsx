import { LauncherCard } from "@olympusoss/canvas";
import { cookies } from "next/headers";
import {
	ArchitectureSection,
	AuthStatusBadgeRow,
	AuthStatusRow,
	CodeSample,
	FeaturesSection,
	HeroSection,
	LoginButton,
	LogoutLink,
	NavBar,
	PlaygroundAdminSection,
	PlaygroundGrid,
	PlaygroundSection,
	SessionDisplay,
	SiteFooter,
	StatusBadge,
} from "../components/site";

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

/**
 * Fetch the latest published `@olympusoss/canvas` version from the npm
 * registry. Hits a public read-only endpoint — no auth required.
 * Cached by Next.js for an hour so the homepage doesn't query npm on every
 * request. Returns an empty string on failure so the badge can hide the
 * version segment gracefully.
 */
async function getLatestCanvasVersion(): Promise<string> {
	try {
		const res = await fetch("https://registry.npmjs.org/@olympusoss/canvas/latest", { next: { revalidate: 3600 } });
		if (!res.ok) return "";
		const data = (await res.json()) as { version?: string };
		return data.version ?? "";
	} catch {
		return "";
	}
}

export default async function HomePage() {
	const [cookieStore, canvasVersion] = await Promise.all([cookies(), getLatestCanvasVersion()]);

	let ciamData: TokenData | null = null;
	let iamData: TokenData | null = null;

	const ciamCookie = cookieStore.get("site_ciam_session");
	if (ciamCookie) {
		try {
			ciamData = JSON.parse(ciamCookie.value);
		} catch {}
	}

	const iamCookie = cookieStore.get("site_iam_session");
	if (iamCookie) {
		try {
			iamData = JSON.parse(iamCookie.value);
		} catch {}
	}

	const ciamAthenaUrl = process.env.NEXT_PUBLIC_CIAM_ATHENA_URL || "http://localhost:3001";
	const iamAthenaUrl = process.env.NEXT_PUBLIC_IAM_ATHENA_URL || "http://localhost:4001";

	const ciamAuthUrl = "/login/ciam";
	const iamAuthUrl = "/login/iam";

	return (
		<>
			<NavBar logoSrc="/logo.svg?v=2" />

			<HeroSection canvasVersion={canvasVersion} />

			<FeaturesSection />

			<ArchitectureSection />

			<PlaygroundSection>
				<PlaygroundGrid>
					<LauncherCard
						tone="indigo"
						badge="C"
						title="Customer login (CIAM)"
						description="Sign in or register on the customer-facing identity domain. Built for end-users of apps you ship."
						href={ciamData ? undefined : ciamAuthUrl}
						target="_blank"
					>
						{ciamData ? (
							<AuthStatusRow>
								<AuthStatusBadgeRow>
									<StatusBadge label="Authenticated" bg="#059669" />
									<LogoutLink href="/logout/ciam">Logout</LogoutLink>
								</AuthStatusBadgeRow>
								<SessionDisplay data={ciamData} />
							</AuthStatusRow>
						) : (
							<LoginButton tone="indigo">Login to CIAM</LoginButton>
						)}
					</LauncherCard>

					<LauncherCard
						tone="violet"
						badge="E"
						title="Employee login (IAM)"
						description="Sign in to the workforce identity domain. SSO, MFA, and provisioning for internal apps."
						href={iamData ? undefined : iamAuthUrl}
						target="_blank"
					>
						{iamData ? (
							<AuthStatusRow>
								<AuthStatusBadgeRow>
									<StatusBadge label="Authenticated" bg="#059669" />
									<LogoutLink href="/logout/iam">Logout</LogoutLink>
								</AuthStatusBadgeRow>
								<SessionDisplay data={iamData} />
							</AuthStatusRow>
						) : (
							<LoginButton tone="violet">Login to IAM</LoginButton>
						)}
					</LauncherCard>
				</PlaygroundGrid>

				<PlaygroundAdminSection>
					<LauncherCard
						tone="slate"
						badge="A"
						title="Admin · Customer identity"
						description="Athena admin for the CIAM domain. Manage identities, sessions, OAuth2 clients, and lockouts."
						href={ciamAthenaUrl}
						target="_blank"
					>
						<LoginButton tone="slate">Open admin</LoginButton>
					</LauncherCard>

					<LauncherCard
						tone="slate"
						badge="A"
						title="Admin · Employee identity"
						description="Athena admin for the IAM domain. Same surface, scoped to the employee identity store."
						href={iamAthenaUrl}
						target="_blank"
					>
						<LoginButton tone="slate">Open admin</LoginButton>
					</LauncherCard>
				</PlaygroundAdminSection>
			</PlaygroundSection>

			<CodeSample />

			<SiteFooter logoSrc="/logo.svg?v=2" />
		</>
	);
}
