import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
			<body className="antialiased bg-base-100 text-base-content font-sans">
				<div className="min-h-screen flex flex-col max-w-5xl mx-auto p-4">
					<Header />
					<div className="flex-1 card bg-base-100 shadow-md">
						<div className="card-body">{children}</div>
					</div>
					<Footer />
				</div>
			</body>
		</html>
	);
}
