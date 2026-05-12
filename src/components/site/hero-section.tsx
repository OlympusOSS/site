"use client";

import { motion } from "framer-motion";
import { Badge, Terminal } from "@olympusoss/canvas";

const TERMINAL_HEAD = `$ npm install -g @olympusoss/octl
$ octl

→ checking Podman, podman-compose, kubectl…
→ starting Podman machine
→ building dev images  (platform · hera · athena · site)
→ bringing up stack   infra → migrations → Ory → apps → seed

✓ kratos      `;
const TERMINAL_HYDRA_PREFIX = `
✓ hydra       `;
const TERMINAL_BODY = `
✓ hera        → http://localhost:3000
✓ athena      → http://localhost:3001
✓ site        → http://localhost:2000

test user → `;
const TERMINAL_TAIL = ` / olympus
`;

function HeroOrbs() {
	return (
		<>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
			>
				<div
					className="hero-orb absolute -right-[100px] -top-[120px] h-[520px] w-[520px] rounded-full"
					style={{
						opacity: 0.38,
						filter: "blur(90px)",
						background:
							"radial-gradient(circle, #6366f1 0%, transparent 70%)",
						animation: "site-drift-a 10s ease-in-out infinite",
					}}
				/>
				<div
					className="hero-orb absolute -bottom-[140px] -left-[100px] h-[460px] w-[460px] rounded-full"
					style={{
						opacity: 0.3,
						filter: "blur(90px)",
						background:
							"radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
						animation: "site-drift-b 12s ease-in-out infinite",
					}}
				/>
				<div
					className="hero-orb absolute left-[38%] top-[20%] h-[300px] w-[300px] rounded-full"
					style={{
						opacity: 0.18,
						filter: "blur(80px)",
						background:
							"radial-gradient(circle, #06b6d4 0%, transparent 70%)",
						animation: "site-drift-a 14s ease-in-out 2s infinite",
					}}
				/>
			</div>
			<style>{`
				@keyframes site-drift-a {
					0%, 100% { transform: translate(0, 0); }
					50% { transform: translate(30px, 40px); }
				}
				@keyframes site-drift-b {
					0%, 100% { transform: translate(0, 0); }
					50% { transform: translate(-34px, -26px); }
				}
				@media (prefers-reduced-motion: reduce) {
					.hero-orb { animation: none !important; }
				}
			`}</style>
		</>
	);
}

function HeroGrid() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 z-0"
			style={{
				backgroundImage:
					"linear-gradient(hsl(230 30% 80% / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(230 30% 80% / 0.35) 1px, transparent 1px)",
				backgroundSize: "44px 44px",
				maskImage:
					"radial-gradient(ellipse 60% 55% at 50% 45%, black 0%, transparent 100%)",
				WebkitMaskImage:
					"radial-gradient(ellipse 60% 55% at 50% 45%, black 0%, transparent 100%)",
			}}
		/>
	);
}

function HeroTerminal() {
	return (
		<div>
			<div className="mb-3.5">
				<div className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
					<span
						aria-hidden="true"
						className="inline-block h-1.5 w-1.5 rounded-full"
						style={{
							background: "#22c55e",
							boxShadow: "0 0 0 3px rgb(34 197 94 / 0.18)",
						}}
					/>
					~60 seconds · zero config
				</div>
				<h3 className="m-0 text-[19px] font-semibold leading-[1.3] tracking-[-0.015em] text-foreground">
					Stand up the whole stack locally with one command.
				</h3>
				<p className="mt-1.5 text-[13.5px] leading-[1.55] text-muted-foreground">
					<code className="font-mono text-[12.5px] text-foreground">
						octl
					</code>{" "}
					auto-installs Podman, builds dev images for every Olympus repo,
					brings up infra → Ory → apps → seed in order, and hands you
					working URLs and a test login.
				</p>
			</div>
			<Terminal
				title="~/Olympus · octl"
				className="shadow-[0_30px_60px_-20px_rgb(0_0_0/0.35)]"
			>
				{TERMINAL_HEAD}
				<span style={{ color: "#86efac" }}>healthy</span>
				{TERMINAL_HYDRA_PREFIX}
				<span style={{ color: "#86efac" }}>healthy</span>
				{TERMINAL_BODY}
				<span style={{ color: "#a5b4fc" }}>admin@olympus.local</span>
				{TERMINAL_TAIL}
			</Terminal>
		</div>
	);
}

export function HeroSection() {
	return (
		<section
			id="top"
			className="relative overflow-hidden px-6 pb-[120px] pt-[112px]"
			style={{
				background:
					"linear-gradient(180deg, hsl(230 50% 98%) 0%, hsl(260 40% 96%) 45%, hsl(0 0% 100%) 100%)",
			}}
		>
			<HeroGrid />
			<HeroOrbs />
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 bottom-0 h-[140px]"
				style={{
					background:
						"linear-gradient(180deg, transparent 0%, hsl(0 0% 100%) 100%)",
					zIndex: 1,
				}}
			/>

			<div className="relative z-10 mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-12 min-[900px]:grid-cols-2">
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Badge
						variant="outline"
						className="border-border bg-background/70 font-mono text-[11px] font-normal backdrop-blur-[6px]"
					>
						v2.3.0 · canvas design system
					</Badge>
					<h1 className="mb-[18px] mt-4 text-[clamp(40px,5vw,52px)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground text-balance">
						Identity and OAuth2, on your terms.
					</h1>
					<p className="mb-7 max-w-[520px] text-[17px] leading-[1.55] text-muted-foreground">
						Olympus is an open-source identity platform built on Ory
						Kratos and Hydra. Self-hosted, standards-compliant, no
						per-seat pricing.
					</p>
					<div className="flex flex-wrap items-center gap-2.5">
						<a
							href="#playground"
							className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground no-underline shadow-sm transition-colors hover:bg-primary/90"
						>
							Open the playground
						</a>
						<a
							href="/docs"
							className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background/80 px-8 text-sm font-medium text-foreground no-underline shadow-sm backdrop-blur-[6px] transition-colors hover:bg-accent"
						>
							Read the docs
						</a>
					</div>
					<div className="mt-7 flex flex-wrap gap-5 font-mono text-xs text-muted-foreground">
						<span>✓ Apache 2.0</span>
						<span>✓ OIDC · OAuth2 · PKCE</span>
						<span>✓ Self-hosted</span>
					</div>
				</motion.div>

				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.15 }}
				>
					<HeroTerminal />
				</motion.div>
			</div>
		</section>
	);
}
