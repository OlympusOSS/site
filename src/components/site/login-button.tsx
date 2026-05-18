"use client";

import type { LauncherCardTone } from "@olympusoss/canvas";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const TONE_FG: Record<LauncherCardTone, string> = {
	default: "hsl(var(--primary))",
	indigo: "hsl(231 60% 38%)",
	violet: "hsl(262 55% 42%)",
	slate: "hsl(230 30% 30%)",
};

interface LoginButtonProps {
	tone: LauncherCardTone;
	children: ReactNode;
}

export function LoginButton({ tone, children }: LoginButtonProps) {
	return (
		<span className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: TONE_FG[tone] }}>
			{children}
			<ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
		</span>
	);
}
