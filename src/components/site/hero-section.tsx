"use client";

import { motion } from "framer-motion";
import { Badge } from "@olympusoss/canvas";

export function HeroSection() {
	return (
		<section className="relative flex items-center justify-center overflow-hidden px-4 pb-12 pt-24 landscape:pb-6 landscape:pt-16 sm:px-6 sm:pt-28 lg:pt-32">
			<div className="relative z-10 mx-auto max-w-3xl text-center">
				{/* Badge */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 px-3 py-1 text-primary">
						Open Source · Self-Hosted · Standards-Based
					</Badge>
				</motion.div>

				{/* Title */}
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="mb-4 text-3xl font-bold tracking-tight text-foreground landscape:mb-2 landscape:text-2xl sm:text-4xl lg:text-6xl"
				>
					<span className="text-primary">
						OlympusOSS
					</span>
					<br />
					Identity Platform
					<br />
					<span className="text-primary">
						for Modern Apps
					</span>
				</motion.h1>

				{/* Subtitle */}
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mx-auto mb-6 max-w-xl text-base leading-relaxed text-muted-foreground landscape:mb-4 landscape:text-sm sm:text-lg"
				>
					Self-hosted authentication and authorization built on{" "}
					<a href="https://github.com/ory/kratos" target="_blank" rel="noopener noreferrer" className="text-foreground no-underline">Ory Kratos</a> and{" "}
					<a href="https://github.com/ory/hydra" target="_blank" rel="noopener noreferrer" className="text-foreground no-underline">Ory Hydra</a>. Dual-domain
					architecture with no vendor lock-in — your users, your data,
					standard protocols.
				</motion.p>

				{/* CTAs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="flex flex-wrap items-center justify-center gap-4"
				>
					<a
						href="#get-started"
						className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
					>
						Get Started
					</a>
					<a
						href="https://github.com/orgs/OlympusOSS/repositories"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-5 py-2.5 text-sm font-medium text-foreground no-underline transition-colors hover:bg-accent"
					>
						View on GitHub
					</a>
				</motion.div>
			</div>
		</section>
	);
}
