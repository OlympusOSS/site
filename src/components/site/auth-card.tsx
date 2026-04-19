"use client";

import { Card, CardContent } from "@olympusoss/canvas";
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
		>
			<Card className="overflow-hidden">
				<CardContent className="p-8">
					<div className="mb-3 flex items-center gap-3">
						<div
							className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white"
							style={{ background: iconBg }}
						>
							{icon}
						</div>
						<h2 className="text-lg font-semibold text-foreground">{title}</h2>
					</div>
					<p className="mb-6 text-sm leading-relaxed text-muted-foreground">
						{description}
					</p>
					{children}
				</CardContent>
			</Card>
		</motion.div>
	);
}
