"use client";

import { motion } from "framer-motion";
import { Card, CardContent, Badge } from "@olympusoss/canvas";

/* Simple inline SVG icons for platform badges */
function PhoneIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
			<line x1="12" y1="18" x2="12.01" y2="18" />
		</svg>
	);
}

function GlobeIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10" />
			<line x1="2" y1="12" x2="22" y2="12" />
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</svg>
	);
}

interface ServiceBox {
	name: string;
	color: string;
	platforms?: Array<{ icon: "phone" | "globe"; label: string }>;
}

const CIAM_SERVICES: ServiceBox[] = [
	{
		name: "Hera",
		color: "#a78bfa",
		platforms: [
			{ icon: "phone", label: "iOS" },
			{ icon: "phone", label: "Android" },
			{ icon: "globe", label: "Web" },
		],
	},
	{
		name: "Athena",
		color: "#c4b5fd",
		platforms: [{ icon: "globe", label: "Web" }],
	},
	{ name: "Hydra", color: "#8b5cf6" },
	{ name: "Kratos", color: "#6366f1" },
];

const IAM_SERVICES: ServiceBox[] = [
	{
		name: "Hera",
		color: "#fbbf24",
		platforms: [
			{ icon: "phone", label: "iOS" },
			{ icon: "phone", label: "Android" },
			{ icon: "globe", label: "Web" },
		],
	},
	{
		name: "Athena",
		color: "#fcd34d",
		platforms: [{ icon: "globe", label: "Web" }],
	},
	{ name: "Hydra", color: "#f97316" },
	{ name: "Kratos", color: "#f59e0b" },
];

function PlatformIcon({ type }: { type: "phone" | "globe" }) {
	return type === "phone" ? <PhoneIcon /> : <GlobeIcon />;
}

/**
 * Animated dotted connection lines.
 *
 * Layout:  Hera (TL)    Athena (TR)
 *          Hydra (BL)   Kratos (BR)
 *
 * Connections (same for both CIAM and IAM):
 *  - Hera <-> Hydra    — vertical left    (Hera is the login/consent UI for Hydra)
 *  - Athena <-> Kratos  — vertical right   (Athena admin manages Kratos identities)
 *  - Hydra <-> Kratos   — horizontal bottom (Hydra uses Kratos for auth)
 */
function ConnectionOverlay({ color, showAthenaToHera }: { color: string; showAthenaToHera?: boolean }) {
	return (
		<svg
			className="pointer-events-none absolute inset-0 z-0 h-full w-full"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			fill="none"
		>
			{/* Hera (cx=23, bot=47) <-> Hydra (cx=23, top=68) — vertical left */}
			<line
				x1="23" y1="47" x2="23" y2="68"
				stroke={color}
				strokeWidth="1.5"
				strokeDasharray="4 3"
				opacity="0.7"
				vectorEffect="non-scaling-stroke"
			>
				<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite" />
			</line>

			{/* Athena (cx=77, bot=47) <-> Kratos (cx=77, top=68) — vertical right */}
			<line
				x1="77" y1="47" x2="77" y2="68"
				stroke={color}
				strokeWidth="1.5"
				strokeDasharray="4 3"
				opacity="0.7"
				vectorEffect="non-scaling-stroke"
			>
				<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" begin="0.5s" repeatCount="indefinite" />
			</line>

			{/* Hydra (right=47) <-> Kratos (left=53) — horizontal bottom */}
			<line
				x1="47" y1="84" x2="53" y2="84"
				stroke={color}
				strokeWidth="1.5"
				strokeDasharray="4 3"
				opacity="0.7"
				vectorEffect="non-scaling-stroke"
			>
				<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" begin="1s" repeatCount="indefinite" />
			</line>

			{/* Athena (TR, cx=72) -> Hydra (BL, cx=35) — L-shaped: down then left (Athena manages OAuth2 clients) */}
			<polyline
				points="72,47 72,60 33,60 33,68"
				stroke={color}
				strokeWidth="1.5"
				strokeDasharray="4 3"
				opacity="0.7"
				vectorEffect="non-scaling-stroke"
				strokeLinejoin="round"
				fill="none"
			>
				<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" begin="1.5s" repeatCount="indefinite" />
			</polyline>

			{/* Athena (right~55) -> Hera (left~45) — horizontal top (IAM only: Athena authenticates via Hera) */}
			{showAthenaToHera && (
				<line
					x1="55" y1="30" x2="45" y2="30"
					stroke={color}
					strokeWidth="1.5"
					strokeDasharray="4 3"
					opacity="0.7"
					vectorEffect="non-scaling-stroke"
				>
					<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" begin="0.7s" repeatCount="indefinite" />
				</line>
			)}
		</svg>
	);
}

/** DB connection line props for the absolute overlay */
const DB_COLOR = "#34d399";

function DomainColumn({
	title,
	subtitle,
	services,
	borderColor,
	lineColor,
	showAthenaToHera,
}: {
	title: string;
	subtitle: string;
	services: ServiceBox[];
	borderColor: string;
	lineColor: string;
	showAthenaToHera?: boolean;
}) {
	return (
		<div
			className="rounded-xl border p-5"
			style={{ borderColor: `${borderColor}40` }}
		>
			<div className="mb-4 text-center">
				<h4 className="text-sm font-semibold text-foreground">{title}</h4>
				<p className="text-[11px] text-muted-foreground">{subtitle}</p>
			</div>
			<div className="relative">
				{/* Connection lines behind the service boxes */}
				<ConnectionOverlay color={lineColor} showAthenaToHera={showAthenaToHera} />

				<div className="relative z-10 grid grid-cols-2 gap-6">
					{services.map((svc) => (
						<div
							key={svc.name}
							className="rounded-lg border border-border bg-card px-3 py-2.5 text-center"
						>
							<div className="text-xs font-medium text-foreground">
								{svc.name}
							</div>
							{svc.platforms && (
								<div className="mt-1 flex items-center justify-center gap-2">
									{svc.platforms.map((p) => (
										<div
											key={p.label}
											className="flex items-center gap-0.5 text-[9px] text-muted-foreground"
										>
											<PlatformIcon type={p.icon} />
											<span>{p.label}</span>
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function ArchitectureSection() {
	return (
		<section id="architecture" className="scroll-mt-20 px-4 py-16 landscape:py-10 sm:px-6 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-4xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.5 }}
					className="mb-8 text-center sm:mb-12 lg:mb-16"
				>
					<h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
						Dual-Domain Architecture
					</h2>
					<p className="text-base text-muted-foreground">
						Separate identity domains for customers and employees —
						clean isolation, shared infrastructure.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<Card>
						<CardContent className="p-6">
							{/*
							 * Wrapper: relative container spanning domains -> shared bar.
							 * Green DB lines are an absolute overlay so they connect
							 * directly from Hydra/Kratos boxes to the PostgreSQL pill.
							 */}
							<div className="relative">
								{/* Two domains side by side */}
								<div className="relative grid gap-4 sm:grid-cols-2">
									<DomainColumn
										title="CIAM"
										subtitle="Customer Identity"
										services={CIAM_SERVICES}
										borderColor="#6366f1"
										lineColor="#818cf8"
									/>
									<DomainColumn
										title="IAM"
										subtitle="Employee Identity"
										services={IAM_SERVICES}
										borderColor="#f59e0b"
										lineColor="#fbbf24"
										showAthenaToHera
									/>
									{/* Cross-domain: CIAM Athena -> IAM Hera (admin SSO via IAM) */}
									<svg
										className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full sm:block"
										viewBox="0 0 200 100"
										preserveAspectRatio="none"
										fill="none"
									>
										{/* Inverted-U: CIAM Athena (cx=73,top=35) -> up -> across -> IAM Hera (cx=127,top=35) */}
										<polyline
											points="73,35 73,25 127,25 127,35"
											stroke="#c084fc"
											strokeWidth="1.5"
											strokeDasharray="4 3"
											opacity="0.6"
											vectorEffect="non-scaling-stroke"
											strokeLinejoin="round"
											fill="none"
										>
											<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2.5s" repeatCount="indefinite" />
										</polyline>
									</svg>
								</div>

								{/* Spacer between domain grid and shared bar */}
								<div className="h-8" />

								{/* Shared services */}
								<div className="relative flex flex-wrap items-center justify-center gap-3 rounded-xl border border-success/20 bg-success/5 px-5 py-3">
									<span className="text-[11px] font-medium uppercase tracking-wider text-success">
										Shared
									</span>
									<Badge variant="outline" className="border-border text-[11px] text-muted-foreground">
										PostgreSQL
									</Badge>
									{/* Animated dotted line: pgAdmin -> PostgreSQL (flows right-to-left) */}
									<svg width="48" height="2" viewBox="0 0 48 2" fill="none" className="-mx-3">
										<line
											x1="0" y1="1" x2="48" y2="1"
											stroke={DB_COLOR}
											strokeWidth="1.5"
											strokeDasharray="4 3"
											opacity="0.6"
										>
											<animate attributeName="stroke-dashoffset" from="0" to="14" dur="2s" repeatCount="indefinite" />
										</line>
									</svg>
									<Badge variant="outline" className="border-border text-[11px] text-muted-foreground">
										pgAdmin
									</Badge>
								</div>

								{/* Green DB connection lines — absolute overlay */}
								<svg
									className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full sm:block"
									viewBox="0 0 200 100"
									preserveAspectRatio="none"
									fill="none"
								>
									{/* CIAM Hydra -> PostgreSQL */}
									<polyline
										points="26,65 26,78.5 91,78.5 91,88"
										stroke={DB_COLOR}
										strokeWidth="1.5"
										strokeDasharray="4 3"
										opacity="0.6"
										vectorEffect="non-scaling-stroke"
										strokeLinejoin="round"
										fill="none"
									>
										<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite" />
									</polyline>

									{/* CIAM Kratos -> PostgreSQL */}
									<polyline
										points="73,65 73,74.5 93,74.5 93,88"
										stroke={DB_COLOR}
										strokeWidth="1.5"
										strokeDasharray="4 3"
										opacity="0.6"
										vectorEffect="non-scaling-stroke"
										strokeLinejoin="round"
										fill="none"
									>
										<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" begin="0.3s" repeatCount="indefinite" />
									</polyline>

									{/* IAM Hydra -> PostgreSQL */}
									<polyline
										points="127,65 127,74.5 95,74.5 95,88"
										stroke={DB_COLOR}
										strokeWidth="1.5"
										strokeDasharray="4 3"
										opacity="0.6"
										vectorEffect="non-scaling-stroke"
										strokeLinejoin="round"
										fill="none"
									>
										<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" begin="0.6s" repeatCount="indefinite" />
									</polyline>

									{/* IAM Kratos -> PostgreSQL */}
									<polyline
										points="174,65 174,78.5 97,78.5 97,88"
										stroke={DB_COLOR}
										strokeWidth="1.5"
										strokeDasharray="4 3"
										opacity="0.6"
										vectorEffect="non-scaling-stroke"
										strokeLinejoin="round"
										fill="none"
									>
										<animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" begin="0.9s" repeatCount="indefinite" />
									</polyline>
								</svg>
							</div>

							{/* Flow description */}
							<div className="mt-6 rounded-lg border border-border bg-muted p-4">
								<p className="text-center text-[12px] leading-relaxed text-muted-foreground">
									<span className="text-foreground">OAuth2 flow:</span>{" "}
									App → Hydra{" "}
									<span className="text-primary">/oauth2/auth</span>{" "}
									→ Hera{" "}
									<span className="text-primary">/login</span> →
									Kratos auth →{" "}
									<span className="text-primary">/consent</span> →
									Hydra issues tokens → App receives code
								</p>
								<p className="mt-1.5 text-center text-[11px] text-muted-foreground">
									Athena admin panels authenticate via IAM Hera (employee SSO)
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</section>
	);
}
