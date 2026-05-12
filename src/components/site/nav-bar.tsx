"use client";

import { NavBar as CanvasNavBar, Logo, type NavLink } from "@olympusoss/canvas";
import { Github } from "lucide-react";
import Link from "next/link";

const NAV_LINKS: NavLink[] = [
	{ label: "Features", href: "#features" },
	{ label: "Architecture", href: "#architecture" },
	{ label: "Playground", href: "#playground" },
	{ label: "Docs", href: "/docs" },
];

export function NavBar({ logoSrc }: { logoSrc?: string }) {
	return (
		<CanvasNavBar
			linkComponent={Link}
			logo={
				logoSrc ? (
					<a href="#" className="flex items-center gap-2.5 no-underline">
						<img
							src={logoSrc}
							alt=""
							aria-hidden="true"
							className="h-8 w-auto"
						/>
						<span className="flex items-baseline gap-2 leading-none">
							<span className="text-base font-semibold tracking-tight text-foreground">
								Olympus
							</span>
							<span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
								open-source identity
							</span>
						</span>
					</a>
				) : (
					<a href="#" className="flex items-center gap-2.5 no-underline">
						<Logo size={24} />
						<span className="flex items-baseline gap-2 leading-none">
							<span className="text-base font-semibold tracking-tight text-foreground">
								Olympus
							</span>
							<span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
								open-source identity
							</span>
						</span>
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
