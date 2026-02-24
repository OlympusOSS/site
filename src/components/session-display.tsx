"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface TokenData {
	access_token: string;
	id_token: string;
	refresh_token?: string;
	token_type: string;
	expires_in: number;
	scope: string;
	claims: {
		sub: string;
		email?: string;
		[key: string]: unknown;
	};
}

export function SessionDisplay({ data }: { data: TokenData }) {
	const [showClaims, setShowClaims] = useState(false);
	const [copied, setCopied] = useState<string | null>(null);

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		setCopied(label);
		setTimeout(() => setCopied(null), 2000);
	};

	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			transition={{ duration: 0.3 }}
			className="space-y-3 text-[13px]"
		>
			{/* User Info */}
			<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
				<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
					User Info
				</h3>
				<div className="space-y-2">
					<InfoRow label="Subject" value={data.claims.sub} mono />
					{data.claims.email && (
						<InfoRow
							label="Email"
							value={data.claims.email as string}
						/>
					)}
					<InfoRow label="Scopes" value={data.scope} />
				</div>
			</div>

			{/* ID Token Claims (collapsible) */}
			<div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
				<button
					type="button"
					onClick={() => setShowClaims(!showClaims)}
					className="flex w-full items-center justify-between p-4 text-left"
				>
					<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
						ID Token Claims
					</h3>
					<motion.svg
						animate={{ rotate: showClaims ? 180 : 0 }}
						transition={{ duration: 0.2 }}
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="text-slate-500"
					>
						<polyline points="6 9 12 15 18 9" />
					</motion.svg>
				</button>
				<AnimatePresence>
					{showClaims && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="overflow-hidden"
						>
							<pre className="mx-4 mb-4 overflow-auto rounded-lg bg-slate-900/50 p-4 text-[11px] leading-relaxed text-indigo-300">
								{JSON.stringify(data.claims, null, 2)}
							</pre>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Tokens */}
			<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
				<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
					Tokens
				</h3>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="min-w-0 flex-1">
							<InfoRow
								label="Access Token"
								value={`${data.access_token.substring(0, 40)}…`}
								mono
							/>
						</div>
						<button
							type="button"
							onClick={() =>
								copyToClipboard(data.access_token, "access")
							}
							className="ml-2 shrink-0 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
						>
							{copied === "access" ? "✓" : "Copy"}
						</button>
					</div>
					<InfoRow label="Type" value={data.token_type} />
					<InfoRow label="Expires" value={`${data.expires_in}s`} />
				</div>
			</div>
		</motion.div>
	);
}

function InfoRow({
	label,
	value,
	mono,
}: { label: string; value: string; mono?: boolean }) {
	return (
		<div className="flex items-baseline gap-2">
			<span className="shrink-0 text-slate-500">{label}:</span>
			<span
				className={`truncate text-slate-200 ${mono ? "font-mono text-[11px]" : ""}`}
			>
				{value}
			</span>
		</div>
	);
}
