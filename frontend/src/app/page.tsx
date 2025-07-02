import Link from "next/link";

export default function Home() {
	return (
		<main className="p-8">
			<div className="hero min-h-screen">
				<div className="hero-content text-center">
					<div className="max-w-md">
						<h1 className="text-5xl font-bold">Hello there</h1>
						<p className="py-6">
							FinSight AI empowers small businesses with AI-driven financial
							insights. Upload your financial reports and interact with our
							WatsonX-powered assistant to get instant, actionable analysis and
							guidance—no data science expertise required.
						</p>
						<Link href="/upload" passHref>
							<button className="btn">Get Started</button>
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
