import { cookies } from "next/headers";
import {
	AuthCard,
	LoginButton,
	DemoStatusBadge as StatusBadge,
	SessionDisplay,
	NavBar,
	HeroSection,
	FeaturesSection,
	ArchitectureSection,
	GettingStartedSection,
	PlaygroundSection,
	PlaygroundGrid,
	PlaygroundAdminSection,
	AuthStatusRow,
	AuthStatusBadgeRow,
	LogoutLink,
	SiteFooter,
} from "@olympusoss/canvas";

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

	const ciamHydraUrl =
		process.env.NEXT_PUBLIC_CIAM_HYDRA_URL || "http://localhost:3102";
	const iamHydraUrl =
		process.env.NEXT_PUBLIC_IAM_HYDRA_URL || "http://localhost:4102";
	const ciamClientId = process.env.CIAM_CLIENT_ID || "site-ciam-client";
	const iamClientId = process.env.IAM_CLIENT_ID || "site-iam-client";
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2000";

	const ciamAuthUrl = `${ciamHydraUrl}/oauth2/auth?client_id=${ciamClientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(`${appUrl}/callback/ciam`)}&state=ciam-site`;
	const iamAuthUrl = `${iamHydraUrl}/oauth2/auth?client_id=${iamClientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(`${appUrl}/callback/iam`)}&state=iam-site`;

	return (
		<>
			<NavBar />

			<HeroSection />

			<PlaygroundSection>
				<PlaygroundGrid>
					<AuthCard
						icon="C"
						iconBg="#a855f7"
						title="Customer Login (CIAM)"
						description="Authenticate as a customer through the CIAM domain"
						index={0}
					>
						{ciamData ? (
							<AuthStatusRow>
								<AuthStatusBadgeRow>
									<StatusBadge
										label="Authenticated"
										bg="#059669"
									/>
									<LogoutLink href="/logout/ciam">
										Logout
									</LogoutLink>
								</AuthStatusBadgeRow>
								<SessionDisplay data={ciamData} />
							</AuthStatusRow>
						) : (
							<LoginButton href={ciamAuthUrl} bg="#a855f7">
								Login to CIAM
							</LoginButton>
						)}
					</AuthCard>

					<AuthCard
						icon="E"
						iconBg="#fb923c"
						title="Employee Login (IAM)"
						description="Authenticate as an employee through the IAM domain"
						index={1}
					>
						{iamData ? (
							<AuthStatusRow>
								<AuthStatusBadgeRow>
									<StatusBadge
										label="Authenticated"
										bg="#059669"
									/>
									<LogoutLink href="/logout/iam">
										Logout
									</LogoutLink>
								</AuthStatusBadgeRow>
								<SessionDisplay data={iamData} />
							</AuthStatusRow>
						) : (
							<LoginButton
								href={iamAuthUrl}
								bg="#fb923c"
							>
								Login to IAM
							</LoginButton>
						)}
					</AuthCard>
				</PlaygroundGrid>

				<PlaygroundAdminSection>
					<AuthCard
						icon="A"
						iconBg="#8b5cf6"
						title="Admin - Customer Identity"
						description="Admin panel for managing customer identities, schemas, and OAuth2 clients on the CIAM domain."
						index={2}
					>
						<LoginButton
							href="http://localhost:3003"
							bg="#8b5cf6"
						>
							Open CIAM Admin
						</LoginButton>
					</AuthCard>

					<AuthCard
						icon="A"
						iconBg="#f97316"
						title="Admin - Employee Identity"
						description="Admin panel for managing employee identities, schemas, and OAuth2 clients on the IAM domain."
						index={3}
					>
						<LoginButton
							href="http://localhost:4003"
							bg="#f97316"
						>
							Open IAM Admin
						</LoginButton>
					</AuthCard>
				</PlaygroundAdminSection>
			</PlaygroundSection>

			<FeaturesSection />
			<ArchitectureSection />
			<GettingStartedSection />
			<SiteFooter />
		</>
	);
}
