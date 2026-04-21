import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import "fumadocs-ui/style.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Olympus — Open-Source Identity Platform",
	description:
		"Self-hosted authentication and authorization for modern apps. Built on Ory Kratos and Hydra. No vendor lock-in.",
	icons: {
		icon: "/favicon.svg",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
			<body className="min-h-screen antialiased">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
