"use client";

import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import type { ReactNode } from "react";

interface LoginButtonProps {
	href: string;
	bg: string;
	children: ReactNode;
}

export function LoginButton({ href, bg, children }: LoginButtonProps) {
	return (
		<motion.a
			href={href}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-[15px] font-semibold text-white no-underline shadow-md transition-shadow duration-200 hover:shadow-lg"
			style={{ background: bg }}
		>
			<LogIn className="h-4 w-4" />
			{children}
		</motion.a>
	);
}
