"use client";

import { Card, CardContent, CardHeader, CardTitle, Icon, type IconName } from "@olympusoss/canvas";
import { motion } from "framer-motion";

interface Feature {
	icon: IconName;
	title: string;
	body: string;
}

const FEATURES: Feature[] = [
	{
		icon: "Users",
		title: "Kratos identity",
		body: "Sign-up, sign-in, recovery, verification, MFA. Extensible schemas per identity type.",
	},
	{
		icon: "Shield",
		title: "Hydra OAuth2",
		body: "Authorization code, client credentials, refresh, PKCE. OIDC-compliant id_tokens.",
	},
	{
		icon: "KeyRound",
		title: "Fine-grained scopes",
		body: "Declare scopes per client. Consent is recorded and revocable from athena.",
	},
	{
		icon: "Lock",
		title: "Brute-force protection",
		body: "Per-identity and per-IP lockouts. Configurable thresholds. Full audit log.",
	},
	{
		icon: "Layers",
		title: "JSON Schema profiles",
		body: "Define employee, customer, or service identities. Traits are typed end-to-end.",
	},
	{
		icon: "Activity",
		title: "Observable",
		body: "OpenTelemetry spans on every admin and runtime call. Ship to any backend.",
	},
];

export function FeaturesSection() {
	return (
		<section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
			<div className="mx-auto max-w-[1100px]">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.5 }}
					className="mb-10 max-w-[640px]"
				>
					<div className="mb-2 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Capabilities</div>
					<h2 className="m-0 text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-[38px] sm:leading-[1.18]">
						Everything Ory gives you,
						<br />
						packaged for humans.
					</h2>
					<p className="mt-3.5 m-0 text-base leading-relaxed text-muted-foreground">
						Canvas, hera, and athena compose a working stack on top of Ory. Bring your own Postgres, deploy anywhere.
					</p>
				</motion.div>

				<div
					className="grid gap-4"
					style={{
						gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					}}
				>
					{FEATURES.map((feature, i) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ duration: 0.4, delay: i * 0.06 }}
						>
							<Card className="h-full">
								<CardHeader className="pb-3">
									<div
										className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-lg"
										style={{
											background: "rgba(99, 102, 241, 0.1)",
											color: "#6366f1",
										}}
									>
										<Icon name={feature.icon} size={18} />
									</div>
									<CardTitle className="text-[15px] font-semibold text-foreground">{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-[1.5] text-muted-foreground">{feature.body}</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
