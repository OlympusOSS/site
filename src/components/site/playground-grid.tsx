"use client";

import type { ReactNode } from "react";

export function PlaygroundGrid({ children }: { children: ReactNode }) {
	return <div className="grid gap-6 sm:grid-cols-2">{children}</div>;
}

export function PlaygroundAdminHeading() {
	return (
		<h3 className="mb-4 text-center text-sm font-semibold text-slate-400">
			Admin Panels
		</h3>
	);
}

export function PlaygroundAdminSection({ children }: { children: ReactNode }) {
	return (
		<div className="mt-8">
			<PlaygroundAdminHeading />
			<PlaygroundGrid>{children}</PlaygroundGrid>
		</div>
	);
}

export function AuthStatusRow({ children }: { children: ReactNode }) {
	return <div className="space-y-3">{children}</div>;
}

export function AuthStatusBadgeRow({ children }: { children: ReactNode }) {
	return <div className="flex items-center gap-2">{children}</div>;
}

export function LogoutLink({
	href,
	children,
}: {
	href: string;
	children: ReactNode;
}) {
	return (
		<a
			href={href}
			className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400 no-underline transition-colors hover:bg-red-600/30"
		>
			{children}
		</a>
	);
}
