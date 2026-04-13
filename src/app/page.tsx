import { cookies } from "next/headers";
import {
	AuthCard,
	LoginButton,
	DemoStatusBadge as StatusBadge,
	SessionDisplay,
} from "@olympusoss/canvas";
import {
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

	const ciamAthenaUrl =
		process.env.NEXT_PUBLIC_CIAM_ATHENA_URL || "http://localhost:3001";
	const iamAthenaUrl =
		process.env.NEXT_PUBLIC_IAM_ATHENA_URL || "http://localhost:4001";

	// Login routes handle state generation + cookie setting in route handlers
	const ciamAuthUrl = "/login/ciam";
	const iamAuthUrl = "/login/iam";

	return (
		<>
			<NavBar logoSrc="/logo.svg?v=2" />

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
							href={ciamAthenaUrl}
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
							href={iamAthenaUrl}
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
			<SiteFooter logoSrc="/logo.svg?v=2" />
		</>
	);
}
