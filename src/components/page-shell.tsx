"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
	return (
		<>
			{/* Animated header */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="mb-12 text-center"
			>
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
					<svg
						width="28"
						height="28"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M12 2L2 7l10 5 10-5-10-5z" />
						<path d="M2 17l10 5 10-5" />
						<path d="M2 12l10 5 10-5" />
					</svg>
				</div>
				<h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
					OlympusOSS Identity Platform
				</h1>
				<p className="mt-2 text-sm text-slate-400 sm:text-base">
					Test OAuth2 authentication flows against both identity
					domains
				</p>
			</motion.div>

			{children}
		</>
	);
}
