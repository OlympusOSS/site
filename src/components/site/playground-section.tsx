"use client";

import { Badge } from "@olympusoss/canvas";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function PlaygroundSection({ children }: { children: ReactNode }) {
	return (
		<section
			id="playground"
			className="scroll-mt-20 border-y border-border bg-[hsl(230_35%_98%)] px-4 py-20 sm:px-6 sm:py-24 dark:bg-[hsl(240_18%_7%)]"
		>
			<div className="mx-auto max-w-[1100px]">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.5 }}
					className="mb-9 max-w-[640px]"
				>
					<Badge variant="outline" className="try-it-out-flash border-border bg-background/60 font-mono text-[11px] font-normal">
						try it out
					</Badge>
					<h2 className="mt-3.5 mb-2.5 text-3xl font-semibold tracking-tight text-foreground sm:text-[36px] sm:leading-[1.1]">
						Live Olympus, two domains.
					</h2>
					<p className="m-0 text-base leading-relaxed text-muted-foreground">
						Real instances on <code className="font-mono text-sm text-foreground">nannier.com</code> — sign in, walk through the full OAuth2 + PKCE
						handshake, then come back with an authorization code.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					{children}

					<div className="mt-7 flex items-start gap-3 rounded-[10px] border border-border bg-background px-4 py-3.5 text-[13px] leading-relaxed text-muted-foreground">
						<Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
						<span>
							Each login button redirects to <strong className="font-medium text-foreground">Ory Hydra</strong>, which routes through{" "}
							<strong className="font-medium text-foreground">Hera</strong> for authentication before returning here with an authorization code.
						</span>
					</div>
				</motion.div>
			</div>

			{/* "try it out" badge animation. Outer-ring glow that pulses outward
				(no scale jitter — keeps the page layout stable) plus a soft
				background-tint sweep so the chip itself reads as alive. Color
				is the brand indigo from the hero-rainbow palette so the flash
				doesn't introduce a new accent colour. Honors prefers-reduced-motion. */}
			<style jsx>{`
				:global(.try-it-out-flash) {
					position: relative;
					animation: try-it-out-flash 1.8s ease-out infinite;
				}
				@keyframes try-it-out-flash {
					0% {
						box-shadow: 0 0 0 0 hsl(243 75% 59% / 0.55);
						background-color: hsl(243 75% 59% / 0.08);
					}
					70% {
						box-shadow: 0 0 0 10px hsl(243 75% 59% / 0);
						background-color: hsl(243 75% 59% / 0);
					}
					100% {
						box-shadow: 0 0 0 0 hsl(243 75% 59% / 0);
						background-color: hsl(243 75% 59% / 0);
					}
				}
				@media (prefers-reduced-motion: reduce) {
					:global(.try-it-out-flash) {
						animation: none !important;
					}
				}
			`}</style>
		</section>
	);
}
