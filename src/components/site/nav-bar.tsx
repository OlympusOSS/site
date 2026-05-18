"use client";

import { NavBar as CanvasNavBar, Logo, type NavLink } from "@olympusoss/canvas";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

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
					<Link href="/" className="flex items-center gap-2.5 no-underline">
						<Image src={logoSrc} alt="" aria-hidden width={32} height={32} className="h-8 w-auto" />
						<span className="flex flex-col leading-tight">
							<span className="text-[15px] font-semibold tracking-tight text-foreground">Olympus</span>
							<span className="font-mono text-[10px] text-muted-foreground">free identity solution</span>
						</span>
					</Link>
				) : (
					<Link href="/" className="flex items-center gap-2.5 no-underline">
						<Logo size={24} />
						<span className="flex flex-col leading-tight">
							<span className="text-[15px] font-semibold tracking-tight text-foreground">Olympus</span>
							<span className="font-mono text-[10px] text-muted-foreground">free identity solution</span>
						</span>
					</Link>
				)
			}
			links={NAV_LINKS}
			actions={
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<a
						href="https://github.com/orgs/OlympusOSS/repositories"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground no-underline transition-colors hover:bg-accent"
					>
						<Github className="h-3.5 w-3.5" />
						GitHub
					</a>
				</div>
			}
		/>
	);
}
