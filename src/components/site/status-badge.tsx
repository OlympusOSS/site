"use client";

import { motion } from "framer-motion";

export function StatusBadge({ label, bg }: { label: string; bg: string }) {
	return (
		<motion.span
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
			style={{ background: bg }}
		>
			<span className="relative flex h-1.5 w-1.5">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
				<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
			</span>
			{label}
		</motion.span>
	);
}
