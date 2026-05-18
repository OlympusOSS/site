"use client";

import Image from "next/image";

const PRODUCT_LINKS = [
	{ label: "hera (auth UI)", href: "https://github.com/OlympusOSS/hera" },
	{ label: "athena (admin)", href: "https://github.com/OlympusOSS/athena" },
	{
		label: "canvas (design system)",
		href: "https://github.com/OlympusOSS/canvas",
	},
	{ label: "SDK", href: "https://github.com/OlympusOSS/sdk" },
];

const DOCS_LINKS = [
	{ label: "Getting started", href: "/docs" },
	{ label: "OAuth2", href: "/docs/integrate/oauth2-overview" },
	{ label: "Kratos schemas", href: "/docs/identity/identity-schemas" },
	{ label: "Self-hosting", href: "/docs/deploy/overview" },
];

const COMPANY_LINKS = [
	{ label: "GitHub", href: "https://github.com/orgs/OlympusOSS/repositories" },
	{ label: "Changelog", href: "/changelog" },
	{ label: "Security", href: "/security" },
	{ label: "Contact", href: "/contact" },
];

interface FooterColumnProps {
	title: string;
	links: { label: string; href: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
	return (
		<div>
			<div className="mb-2.5 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">{title}</div>
			<ul className="m-0 flex list-none flex-col gap-2 p-0">
				{links.map((link) => (
					<li key={link.label}>
						<a href={link.href} className="text-[13px] font-medium text-muted-foreground no-underline transition-colors hover:text-foreground">
							{link.label}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}

export function SiteFooter({ logoSrc }: { logoSrc?: string }) {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-background px-4 pb-6 pt-12 sm:px-6">
			<div className="mx-auto max-w-[1100px]">
				<div className="grid gap-8 sm:grid-cols-2 lg:[grid-template-columns:1.4fr_1fr_1fr_1fr]">
					<div className="sm:col-span-2 lg:col-span-1">
						<div className="mb-2.5 flex items-center gap-2.5">
							{logoSrc && <Image src={logoSrc} alt="Olympus" width={22} height={22} className="h-[22px] w-auto" />}
							<span className="text-sm font-semibold text-foreground">Olympus</span>
						</div>
						<p className="m-0 max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
							A free identity solution and OAuth2 layer for teams that run their own infrastructure.
						</p>
					</div>
					<FooterColumn title="Product" links={PRODUCT_LINKS} />
					<FooterColumn title="Docs" links={DOCS_LINKS} />
					<FooterColumn title="Company" links={COMPANY_LINKS} />
				</div>

				<div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row">
					<span>Apache 2.0 · © {year} Olympus</span>
					<span className="font-mono">v2.3.0</span>
				</div>
			</div>
		</footer>
	);
}
