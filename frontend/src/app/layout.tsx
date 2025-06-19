import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "SkillsBuild Finance App",
	description: "Empowering small businesses with AI-driven financial insights",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base-100 text-base-content font-sans`}
			>
				<div className="max-w-5xl mx-auto p-4">
					<header className="mb-6">
						<h1 className="text-2xl font-bold">💼 SkillsBuild Finance App</h1>
						<nav className="mt-2 flex gap-4">
							<Link href="/" className="link">
								Home
							</Link>
							<Link href="/upload" className="link">
								Upload
							</Link>
							<Link href="/insights" className="link">
								Insights
							</Link>
							<Link href="/tutorial" className="link">
								Tutorial
							</Link>
						</nav>
					</header>
					{children}
				</div>
			</body>
		</html>
	);
}
