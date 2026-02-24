import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Demo App — OAuth2 Test Client",
	description:
		"Test application for CIAM and IAM OAuth2 authentication flows",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body className="min-h-screen antialiased">
				{children}
			</body>
		</html>
	);
}
