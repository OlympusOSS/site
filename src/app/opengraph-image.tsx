import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * Open Graph / Twitter card image for the homepage.
 *
 * Next.js convention: dropping `opengraph-image.tsx` into a route segment makes
 * Next render this as the `og:image` for every page under that segment, and
 * also doubles as the Twitter `summary_large_image`. Set the alt + size +
 * contentType exports below per the spec.
 *
 * Style mirrors the hero section without embedding it pixel-for-pixel —
 * `next/og` only supports flex layout + a subset of CSS, so this is a
 * static interpretation of the hero rather than a real screenshot. The
 * brand colours match canvas's dark-mode tokens (background hsl(225,24%,6%),
 * the indigo→light-blue gradient ring from logo.svg).
 *
 * Cache: Next.js fingerprints this output and serves it with strong cache
 * headers. To force-refresh after editing this file, ship a deploy and the
 * new URL hash is picked up by social-network scrapers on the next preview
 * request. (WhatsApp specifically caches aggressively for ~24h; ask
 * recipients to wait or use https://developers.facebook.com/tools/debug/ to
 * force a refresh against the OG inspector.)
 */

export const alt = "Olympus — a free identity solution";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
	// Read the logo at build time and inline it as base64 so the rendered
	// image has no external dependency.
	const logoPath = path.join(process.cwd(), "public", "logo.svg");
	const logoSvg = await readFile(logoPath, "utf-8").catch(() => null);
	const logoDataUri = logoSvg ? `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}` : null;

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				background: "linear-gradient(135deg, #0d101a 0%, #11152a 60%, #1a1f3d 100%)",
				color: "#e7e8eb",
				padding: "64px 80px",
				fontFamily: "Inter, system-ui, sans-serif",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Decorative gradient orb to echo the hero's HeroOrbs feel */}
			<div
				style={{
					position: "absolute",
					top: "-180px",
					right: "-180px",
					width: "560px",
					height: "560px",
					borderRadius: "50%",
					background: "radial-gradient(circle, rgba(96,165,250,0.28) 0%, rgba(30,64,175,0.08) 50%, transparent 70%)",
					display: "flex",
				}}
			/>
			<div
				style={{
					position: "absolute",
					bottom: "-200px",
					left: "-120px",
					width: "480px",
					height: "480px",
					borderRadius: "50%",
					background: "radial-gradient(circle, rgba(30,64,175,0.22) 0%, rgba(96,165,250,0.06) 50%, transparent 70%)",
					display: "flex",
				}}
			/>

			{/* Brand row */}
			<div style={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 2 }}>
				{logoDataUri && (
					// biome-ignore lint/performance/noImgElement: next/og only supports <img>
					<img src={logoDataUri} alt="" width={56} height={94} style={{ display: "block" }} />
				)}
				<div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
					<span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>Olympus</span>
					<span
						style={{
							fontSize: 16,
							color: "#9aa3b2",
							fontFamily: "ui-monospace, SFMono-Regular, monospace",
							marginTop: 4,
						}}
					>
						free identity solution
					</span>
				</div>
			</div>

			{/* Headline + supporting copy */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					marginTop: "auto",
					marginBottom: "32px",
					zIndex: 2,
				}}
			>
				<h1
					style={{
						margin: 0,
						fontSize: 84,
						fontWeight: 600,
						lineHeight: 1.05,
						letterSpacing: "-0.03em",
						color: "#f5f6f8",
						maxWidth: "920px",
					}}
				>
					Identity and OAuth2, on your terms.
				</h1>
				<p
					style={{
						margin: "28px 0 0",
						fontSize: 28,
						lineHeight: 1.4,
						color: "#b6bdc9",
						maxWidth: "880px",
					}}
				>
					Self-hosted, built on Ory Kratos and Hydra. Standards-compliant. No per-seat pricing.
				</p>
			</div>

			{/* Feature pills. SVG checkmark instead of U+2713 — next/og's Inter
				fallback doesn't carry that glyph and renders a missing-glyph box. */}
			<div style={{ display: "flex", gap: "16px", zIndex: 2 }}>
				{["Apache 2.0", "OIDC · OAuth2 · PKCE", "Self-hosted"].map((label) => (
					<div
						key={label}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							padding: "8px 18px",
							borderRadius: "999px",
							background: "rgba(255,255,255,0.06)",
							border: "1px solid rgba(255,255,255,0.12)",
							fontSize: 18,
							color: "#c8cfd9",
							fontFamily: "ui-monospace, SFMono-Regular, monospace",
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>{label}</span>
					</div>
				))}
			</div>
		</div>,
		{ ...size },
	);
}
