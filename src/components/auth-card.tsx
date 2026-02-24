"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AuthCardProps {
	icon: string;
	iconBg: string;
	title: string;
	description: string;
	children: ReactNode;
	index: number;
}

export function AuthCard({
	icon,
	iconBg,
	title,
	description,
	children,
	index,
}: AuthCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				delay: 0.2 + index * 0.1,
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1],
			}}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
			className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-sm transition-colors duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
		>
			{/* Gradient glow on hover */}
			<div
				className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				style={{
					background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${iconBg}10, transparent 40%)`,
				}}
			/>

			<div className="relative">
				<div className="mb-3 flex items-center gap-3">
					<div
						className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
						style={{
							background: iconBg,
							boxShadow: `0 4px 14px ${iconBg}40`,
						}}
					>
						{icon}
					</div>
					<h2 className="text-lg font-semibold text-white">{title}</h2>
				</div>
				<p className="mb-6 text-sm leading-relaxed text-slate-400">
					{description}
				</p>
				{children}
			</div>
		</motion.div>
	);
}

interface LoginButtonProps {
	href: string;
	bg: string;
	textColor?: string;
	children: ReactNode;
}

export function LoginButton({
	href,
	bg,
	textColor = "white",
	children,
}: LoginButtonProps) {
	return (
		<motion.a
			href={href}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-6 py-2.5 text-[15px] font-semibold no-underline shadow-lg transition-shadow duration-200 hover:shadow-xl"
			style={{
				background: bg,
				color: textColor,
				boxShadow: `0 4px 14px ${bg}30`,
			}}
		>
			{/* Shimmer overlay */}
			<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
			<span className="relative flex items-center gap-2">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
					<polyline points="10 17 15 12 10 7" />
					<line x1="15" y1="12" x2="3" y2="12" />
				</svg>
				{children}
			</span>
		</motion.a>
	);
}

export function StatusBadge({ label, bg }: { label: string; bg: string }) {
	return (
		<motion.span
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
			style={{ background: bg }}
		>
			<span className="relative flex h-1.5 w-1.5">
				<span
					className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
					style={{ background: "currentColor" }}
				/>
				<span
					className="relative inline-flex h-1.5 w-1.5 rounded-full"
					style={{ background: "currentColor" }}
				/>
			</span>
			{label}
		</motion.span>
	);
}
