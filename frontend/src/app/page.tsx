import Link from "next/link";
import Image from "next/image";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type NewsItem = {
	id: string;
	title: string;
	source: string;
	date: string;
	url: string;
	tickers?: string[];
};

async function getNews(): Promise<NewsItem[]> {
	try {
		const base = process.env.NEXT_PUBLIC_BASE_URL || "";
		const res = await fetch(`${base}/api/news?countries=gb,us&limit=9`, {
			cache: "no-store",
		});
		if (!res.ok) return [];
		const data = await res.json();
		if (!Array.isArray(data)) return [];
		return data as NewsItem[];
	} catch {
		return [];
	}
}

export default async function Home() {
	const news = await getNews();

	return (
		<main className="p-0">
			{/* HERO */}
			<section className="hero min-h-[70vh] bg-base-200">
				<div className="hero-content flex-col lg:flex-row-reverse gap-10">
					{/* (Optional) Logo or Illustration */}
					<div className="hidden lg:block">
						<div className="mask mask-squircle bg-base-300/60 p-6">
							<Image
								src="/logo.png"
								alt="FinSight AI Logo"
								width={160}
								height={160}
								className="rounded-2xl"
								priority
							/>
						</div>
					</div>

					<div className="max-w-xl text-center lg:text-left">
						<div className="badge badge-primary badge-outline mb-3">
							AI for SME Finance
						</div>
						<h1 className="text-5xl font-bold tracking-tight">
							Understand your numbers in minutes.
						</h1>
						<p className="py-6 text-base-content/80">
							FinSight AI empowers small businesses with AI-driven financial
							insights. Upload statements and get instant, actionable analysis
							powered by WatsonX—no data science required.
						</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Link href="/upload" className="btn btn-primary">
								Get Started
							</Link>
							<Link href="/tutorial" className="btn btn-outline">
								See Tutorial
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* INTRODUCTION */}
			<section className="px-6 lg:px-10 py-12">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center gap-2 mb-4">
						<div className="w-2 h-6 bg-primary rounded"></div>
						<h2 className="text-2xl sm:text-3xl font-semibold">
							What is FinSight AI?
						</h2>
					</div>

					<div className="grid lg:grid-cols-3 gap-6">
						<div className="card bg-base-100 shadow">
							<div className="card-body">
								<h3 className="card-title">1) Upload</h3>
								<p>
									Drop PDFs/CSVs of income statements, balance sheets, or cash
									flows. We’ll parse and clean them automatically.
								</p>
							</div>
						</div>
						<div className="card bg-base-100 shadow">
							<div className="card-body">
								<h3 className="card-title">2) Analyse</h3>
								<p>
									Our WatsonX-powered assistant explains trends, flags risks,
									and answers questions in plain English.
								</p>
							</div>
						</div>
						<div className="card bg-base-100 shadow">
							<div className="card-body">
								<h3 className="card-title">3) Act</h3>
								<p>
									Turn insights into action with tailored tips: improve cash
									flow, reduce costs, and plan growth scenarios.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-8 grid sm:grid-cols-2 gap-6">
						<div className="stats shadow bg-base-100">
							<div className="stat">
								<div className="stat-title">Onboarding</div>
								<div className="stat-value text-primary">~2 min</div>
								<div className="stat-desc">No setup. Just upload & go.</div>
							</div>
						</div>
						<div className="stats shadow bg-base-100">
							<div className="stat">
								<div className="stat-title">Supported Docs</div>
								<div className="stat-value">PDF & CSV</div>
								<div className="stat-desc">Income, Balance, Cash-flow</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FINANCIAL NEWS */}
			<section className="px-6 lg:px-10 py-12 bg-base-200">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<div className="w-2 h-6 bg-primary rounded"></div>
							<h2 className="text-2xl sm:text-3xl font-semibold">
								Financial News
							</h2>
						</div>
					</div>

					<p className="text-base-content/70 mb-6">
						Stay on top of markets, lending, and SME trends.
					</p>

					{news.length === 0 ? (
						<div className="alert">
							<span>
								No headlines right now. Try again shortly or adjust filters.
							</span>
						</div>
					) : (
						<div className="grid md:grid-cols-3 gap-6">
							{news.map((n) => (
								<article key={n.id} className="card bg-base-100 shadow group">
									<div className="card-body">
										<h3 className="card-title leading-tight group-hover:underline">
											<a href={n.url} target="_blank" rel="noreferrer">
												{n.title}
											</a>
										</h3>
										<p className="text-sm text-base-content/70">
											{n.source} • {new Date(n.date).toLocaleDateString()}
										</p>

										{n.tickers && n.tickers.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-2">
												{n.tickers.slice(0, 4).map((t) => (
													<span key={t} className="badge badge-ghost">
														{t}
													</span>
												))}
											</div>
										)}

										<div className="card-actions justify-end mt-3">
											<a
												href={n.url}
												target="_blank"
												rel="noreferrer"
												className="btn btn-sm btn-outline"
											>
												Read
											</a>
										</div>
									</div>
								</article>
							))}
						</div>
					)}
				</div>
			</section>

			{/* CTA STRIP */}
			<section className="px-6 lg:px-10 py-10">
				<div className="max-w-6xl mx-auto">
					<div className="card bg-gradient-to-r from-base-200 to-base-300 shadow">
						<div className="card-body items-center text-center gap-4">
							<h3 className="text-2xl font-semibold">
								Ready to unlock insights from your finances?
							</h3>
							<div className="flex flex-col sm:flex-row gap-3">
								<Link href="/upload" className="btn btn-primary">
									Upload a file
								</Link>
								<Link href="/tutorial" className="btn btn-outline">
									Learn how it works
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
