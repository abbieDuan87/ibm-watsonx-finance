import { NextResponse } from "next/server";

type MarketauxArticle = {
	uuid: string;
	title: string;
	description?: string;
	published_at: string; // UTC
	url: string;
	source?: string;
	entities?: Array<{ symbol?: string; name?: string; type?: string }>;
};

type MarketauxResponse = {
	data: MarketauxArticle[];
	meta?: unknown;
};

type OutArticle = {
	id: string;
	title: string;
	source: string;
	date: string;
	url: string;
	tickers: string[];
};

// ------- simple in-memory cache (per server instance) -------
let cache: { data: OutArticle[]; ts: number } | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
	try {
		// Serve from cache if fresh
		const now = Date.now();
		if (cache && now - cache.ts < TTL_MS) {
			return NextResponse.json(cache.data, { status: 200 });
		}

		const { searchParams } = new URL(request.url);

		// Optional query params you can pass from the client:
		const q = searchParams.get("q") || ""; // free-text search
		const tickers = searchParams.get("tickers") || ""; // e.g. "AAPL,MSFT"
		const countries = searchParams.get("countries") || "gb,us";
		const language = searchParams.get("language") || "en";
		const limit = Number(searchParams.get("limit") || 9); // free plan returns max 3 per request
		const sort = searchParams.get("sort") || "published_at:desc";

		const token = process.env.MARKETAUX_API_KEY;
		if (!token) {
			return NextResponse.json(
				{ error: "MARKETAUX_API_KEY is not set" },
				{ status: 500 }
			);
		}

		// Marketaux finance & market news endpoint
		// Docs show /v1/news/all with filters like countries, language, etc.
		// We'll bias to finance topics + your filters.
		const params = new URLSearchParams({
			api_token: token,
			countries,
			language,
			sort,
			// Marketaux free tier allows 3 articles per request; we still pass user limit,
			// the API will cap as per plan.
			limit: String(limit),
		});

		if (q) params.set("search", q);
		if (tickers) params.set("symbols", tickers);
		// Narrow to finance/business topics if desired:
		params.set("topics", "finance");

		const url = `https://api.marketaux.com/v1/news/all?${params.toString()}`;

		const res = await fetch(url, { method: "GET", next: { revalidate: 0 } });
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			return NextResponse.json(
				{ error: `Marketaux error (${res.status})`, detail: text },
				{ status: res.status }
			);
		}

		const json = (await res.json()) as MarketauxResponse;

		const out: OutArticle[] = (json.data || []).map((a) => ({
			id: a.uuid,
			title: a.title,
			source: a.source || "Unknown",
			date: a.published_at,
			url: a.url,
			tickers: (a.entities || [])
				.map((e) => e.symbol)
				.filter(Boolean) as string[],
		}));

		// update cache
		cache = { data: out, ts: now };

		return NextResponse.json(out, { status: 200 });
	} catch (err: unknown) {
		let message = "Unexpected server error";
		if (err instanceof Error) {
			message = err.message;
		} else if (typeof err === "string") {
			message = err;
		}

		return NextResponse.json(
			{ error: "Unexpected server error", detail: message },
			{ status: 500 }
		);
	}
}
