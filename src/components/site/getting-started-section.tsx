"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CodeBlock } from "@olympusoss/canvas";

interface Step {
	number: string;
	title: string;
	description: string;
	code: string;
	language: string;
}

const DEV_STEPS: Step[] = [
	{
		number: "01",
		title: "Clone the repos",
		description: "Multi-repo workspace — clone all repos as siblings.",
		code: `mkdir Olympus && cd Olympus
for repo in platform athena hera site canvas sdk; do
  git clone https://github.com/OlympusOSS/\$repo.git
done`,
		language: "bash",
	},
	{
		number: "02",
		title: "Start the platform",
		description:
			"Podman Compose starts 13 services with live reload for all apps.",
		code: `cd platform/dev
podman compose up -d`,
		language: "bash",
	},
	{
		number: "03",
		title: "Open the apps",
		description: "Edit app code locally — changes reflect instantly via hot reload.",
		code: `# Site, docs & OAuth2 playground
open http://localhost:2000

# Admin dashboards
open http://localhost:3001  # CIAM Admin
open http://localhost:4001  # IAM Admin

# Login: admin@demo.user / admin123!`,
		language: "bash",
	},
];

const PROD_STEPS: Step[] = [
	{
		number: "01",
		title: "Launch Daedalus",
		description: "The deployment wizard handles everything — VPS, DNS, certs, secrets.",
		code: `# Download from GitHub Releases
# or build from source:
cd daedalus
npx tauri build --debug`,
		language: "bash",
	},
	{
		number: "02",
		title: "Configure & deploy",
		description:
			"Daedalus provisions your Hostinger VPS, generates SSL certs, sets GitHub Secrets, and triggers the deploy.",
		code: `# Daedalus wizard configures:
# ├── Hostinger VPS + firewall
# ├── Domain + DNS records
# ├── PostgreSQL SSL certificates
# ├── GitHub Secrets & Variables
# └── One-click deploy via GitHub Actions`,
		language: "bash",
	},
	{
		number: "03",
		title: "Push to deploy",
		description:
			"Tag a release — GitHub Actions builds, pushes to GHCR, and deploys to your VPS.",
		code: `# Bump version
octl bump

# CD triggers on release tags (v*)
# ├── Build container images
# ├── Push to GitHub Container Registry
# ├── SSH deploy to VPS
# └── Health check verification`,
		language: "bash",
	},
];

function StepCard({ step }: { step: Step }) {
	return (
		<div>
			<div className="mb-3 flex items-start gap-3">
				<span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary sm:h-8 sm:w-8">
					{step.number}
				</span>
				<div className="min-w-0">
					<h3 className="text-sm font-semibold text-foreground">
						{step.title}
					</h3>
					<p className="text-[12px] leading-relaxed text-muted-foreground">
						{step.description}
					</p>
				</div>
			</div>
			<CodeBlock code={step.code} language={step.language} />
		</div>
	);
}

export function GettingStartedSection() {
	return (
		<section id="get-started" className="scroll-mt-20 px-4 py-16 landscape:py-10 sm:px-6 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-5xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.5 }}
					className="mb-8 text-center sm:mb-12 lg:mb-16"
				>
					<h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
						Get Started
					</h2>
					<p className="text-base text-muted-foreground">
						Up and running in three steps — locally or in
						production.
					</p>
				</motion.div>

				<div className="grid gap-6 sm:grid-cols-2">
					{/* Dev */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{ duration: 0.4 }}
						className="min-w-0"
					>
						<Card className="h-full">
							<CardContent className="p-4 sm:p-6">
								<div className="mb-5 text-center sm:mb-8">
									<h3 className="text-lg font-bold text-green-500">
										Development
									</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										Podman Compose + live reload
									</p>
								</div>
								<div className="space-y-5 sm:space-y-6">
									{DEV_STEPS.map((step) => (
										<StepCard
											key={step.number}
											step={step}
										/>
									))}
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Prod */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className="min-w-0"
					>
						<Card className="h-full">
							<CardContent className="p-4 sm:p-6">
								<div className="mb-5 text-center sm:mb-8">
									<h3 className="text-lg font-bold text-primary">
										Production
									</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										Daedalus + GitHub Actions
									</p>
								</div>
								<div className="space-y-5 sm:space-y-6">
									{PROD_STEPS.map((step) => (
										<StepCard
											key={step.number}
											step={step}
										/>
									))}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
