import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "fumadocs-ui/style.css";
import "@/styles/globals.css";

// Canonical site URL used as the OpenGraph base. `NEXT_PUBLIC_APP_URL` is set
// per-environment (prod = https://olympus.nannier.com); the fallback keeps
// local dev sane.
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://olympus.nannier.com";
const TITLE = "Olympus — a free identity solution";
const DESCRIPTION = "Self-hosted authentication and authorization for modern apps. Built on Ory Kratos and Hydra. No vendor lock-in.";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		// Per-page titles can override `title` and Next.js will fall back to the
		// template if the route only sets a string (which most do).
		default: TITLE,
		template: "%s — Olympus",
	},
	description: DESCRIPTION,
	icons: {
		icon: "/favicon.svg",
	},
	// The `og:image` is auto-injected by Next.js because of the
	// `app/opengraph-image.tsx` route. Twitter card uses the same image by
	// default, so we only need to set the card type and handles here.
	openGraph: {
		type: "website",
		url: SITE_URL,
		siteName: "Olympus",
		title: TITLE,
		description: DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description: DESCRIPTION,
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
			<body className="min-h-screen antialiased">
				<RootProvider
					theme={{
						defaultTheme: "light",
						enableSystem: false,
					}}
				>
					{children}
				</RootProvider>
			</body>
		</html>
	);
}
