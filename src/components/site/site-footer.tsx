"use client";

function GitHubIcon({ size = 14 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
		</svg>
	);
}

const FOOTER_LINKS = [
	{
		label: "GitHub",
		href: "https://github.com/orgs/OlympusOSS/repositories",
	},
	{
		label: "Ory Kratos",
		href: "https://www.ory.sh/kratos/",
	},
	{
		label: "Ory Hydra",
		href: "https://www.ory.sh/hydra/",
	},
];

const REPO_LINKS = [
	{ label: "Platform", href: "https://github.com/OlympusOSS/platform" },
	{ label: "Athena", href: "https://github.com/OlympusOSS/athena" },
	{ label: "Hera", href: "https://github.com/OlympusOSS/hera" },
	{ label: "Canvas", href: "https://github.com/OlympusOSS/canvas" },
	{ label: "octl", href: "https://github.com/OlympusOSS/octl" },
];

export function SiteFooter({ logoSrc }: { logoSrc?: string }) {
	return (
		<footer className="border-t border-white/5 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
			<div className="mx-auto max-w-6xl">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{/* Brand */}
					<div>
						<div className="mb-3 flex items-center gap-2">
							{logoSrc && (
								<img
									src={logoSrc}
									alt="Olympus"
									width={64}
									height={64}
								/>
							)}
							<span className="text-sm font-bold text-white">
								OlympusOSS
							</span>
						</div>
						<p className="text-[13px] leading-relaxed text-slate-500">
							Open-source identity platform built on Ory Kratos
							and Hydra. Self-hosted, standards-based, no vendor
							lock-in.
						</p>
					</div>

					{/* Repos */}
					<div>
						<h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
							Repositories
						</h4>
						<ul className="space-y-2">
							{REPO_LINKS.map((link) => (
								<li key={link.label}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[13px] text-slate-500 no-underline transition-colors hover:text-white"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Links */}
					<div>
						<h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
							Resources
						</h4>
						<ul className="space-y-2">
							{FOOTER_LINKS.map((link) => (
								<li key={link.label}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[13px] text-slate-500 no-underline transition-colors hover:text-white"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
					<p className="text-[12px] text-slate-600">
						MIT License © {new Date().getFullYear()} OlympusOSS
					</p>
					<a
						href="https://github.com/orgs/OlympusOSS/repositories"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 text-[12px] text-slate-600 no-underline transition-colors hover:text-slate-400"
					>
						<GitHubIcon size={14} />
						Star us on GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}
