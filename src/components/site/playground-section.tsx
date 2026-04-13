"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PlaygroundSection({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<section id="playground" className="scroll-mt-20 px-4 pb-16 pt-8 landscape:pb-10 landscape:pt-6 sm:px-6 sm:pb-20 sm:pt-12 lg:pb-24">
			<div className="mx-auto max-w-[960px]">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.5 }}
					className="mb-8 text-center sm:mb-12 lg:mb-16"
				>
					<h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
						Try It Out
					</h2>
					<p className="text-base text-slate-400">
						OAuth2 playground — test the full authorization code flow
						against the CIAM and IAM domains.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					{/* Auth Cards */}
					{children}

					{/* Explanation */}
					<p className="mt-6 text-center text-[13px] leading-relaxed text-slate-500">
						Each login button redirects to Ory Hydra, which routes
						through Hera for authentication before returning here
						with an authorization code.
					</p>
				</motion.div>
			</div>
		</section>
	);
}
