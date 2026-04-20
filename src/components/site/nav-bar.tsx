"use client";

import { NavBar as CanvasNavBar, OlympusLogo, type NavLink } from "@olympusoss/canvas";
import { Github } from "lucide-react";

const NAV_LINKS: NavLink[] = [
	{ label: "Playground", href: "#playground" },
	{ label: "Features", href: "#features" },
	{ label: "Architecture", href: "#architecture" },
	{ label: "Get Started", href: "#get-started" },
];

export function NavBar({ logoSrc }: { logoSrc?: string }) {
	return (
		<CanvasNavBar
			logo={
				logoSrc ? (
					<a href="#" className="flex items-center no-underline">
						<img src={logoSrc} alt="OlympusOSS" width={24} height={24} className="p-1" />
					</a>
				) : (
					<a href="#" className="no-underline">
						<OlympusLogo size={24} />
					</a>
				)
			}
			links={NAV_LINKS}
			actions={
				<a
					href="https://github.com/orgs/OlympusOSS/repositories"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground no-underline transition-colors hover:bg-accent"
				>
					<Github className="h-3.5 w-3.5" />
					GitHub
				</a>
			}
		/>
	);
}
