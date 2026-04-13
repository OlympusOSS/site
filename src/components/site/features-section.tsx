"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, Icon, type IconName } from "@olympusoss/canvas";

interface Feature {
	icon: IconName;
	title: string;
	description: string;
	color: string;
}

const FEATURES: Feature[] = [
	{
		icon: "users",
		title: "Identity Management",
		description:
			"Full user lifecycle powered by Ory Kratos — registration, login, account recovery, verification, and profile management with schema-driven identities.",
		color: "#6366f1",
	},
	{
		icon: "key-round",
		title: "OAuth2 & OIDC",
		description:
			"Standards-compliant authorization server powered by Ory Hydra — authorization code flow, client credentials, PKCE, and OpenID Connect discovery.",
		color: "#f59e0b",
	},
	{
		icon: "shapes",
		title: "Dual-Domain Architecture",
		description:
			"Separate CIAM (customer-facing) and IAM (employee-facing) domains with independent Kratos and Hydra instances for clean isolation.",
		color: "#10b981",
	},
	{
		icon: "dashboard",
		title: "Admin Dashboard",
		description:
			"Athena gives you full visibility into identities, sessions, OAuth2 clients, tokens, courier messages, and schemas with analytics.",
		color: "#dc2626",
	},
	{
		icon: "lock",
		title: "No Vendor Lock-In",
		description:
			"Built on open standards (OAuth2, OIDC, SCIM). Your data lives in PostgreSQL — export users, credentials, and sessions anytime. No proprietary APIs.",
		color: "#8b5cf6",
	},
	{
		icon: "server",
		title: "Self-Hosted & Portable",
		description:
			"Deploy anywhere with Podman Compose — your infrastructure, your cloud, your rules. Fully automated with GitHub Actions CI/CD.",
		color: "#0ea5e9",
	},
];

export function FeaturesSection() {
	return (
		<section id="features" className="scroll-mt-20 px-4 py-16 landscape:py-10 sm:px-6 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.5 }}
					className="mb-8 text-center sm:mb-12 lg:mb-16"
				>
					<h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
						Everything You Need
					</h2>
					<p className="text-base text-muted-foreground">
						A complete identity stack — authentication, authorization, and
						administration.
					</p>
				</motion.div>

				<div className="grid gap-6 sm:grid-cols-2 landscape:grid-cols-3 lg:grid-cols-3">
					{FEATURES.map((feature, i) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ duration: 0.4, delay: i * 0.1 }}
						>
							<Card className="h-full">
								<CardHeader className="pb-2">
									<div
										className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
										style={{ backgroundColor: `${feature.color}20` }}
									>
										<Icon
											name={feature.icon}
											size={20}
											style={{ color: feature.color }}
										/>
									</div>
									<CardTitle className="text-base text-foreground">
										{feature.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-[13px] leading-relaxed text-muted-foreground">
										{feature.description}
									</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
