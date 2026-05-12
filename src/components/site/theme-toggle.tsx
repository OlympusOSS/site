"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Compact theme switcher for the marketing nav.
 *
 * Reads/writes the current theme via `next-themes` (already wired up by
 * fumadocs' RootProvider in app/layout.tsx). Renders a sun icon when the
 * resolved theme is light, a moon icon when dark. Clicking toggles between
 * the two — system preference is the initial default but explicit clicks
 * override it.
 *
 * The button is render-deferred until `mounted` to avoid an SSR/CSR
 * mismatch (the theme is only known on the client).
 */
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Reserve the same dimensions so the nav doesn't shift on hydrate.
		return (
			<span
				aria-hidden="true"
				className="inline-block h-8 w-8 rounded-full"
			/>
		);
	}

	const isDark = resolvedTheme === "dark";
	const Icon = isDark ? Sun : Moon;
	const next = isDark ? "light" : "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(next)}
			aria-label={`Switch to ${next} theme`}
			title={`Switch to ${next} theme`}
			className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-colors hover:bg-accent"
		>
			<Icon className="h-3.5 w-3.5" />
		</button>
	);
}
