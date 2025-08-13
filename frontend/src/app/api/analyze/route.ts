export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	try {
		const base = process.env.BACKEND_BASE_URL || "http://127.0.0.1:8000";
		const path = process.env.BACKEND_ANALYZE_PATH || "/api/analyze";
		const body = await req.text();
		const ct = req.headers.get("content-type") || "application/json";

		const url = `${base}${path}`;

		const upstream = await fetch(url, {
			method: "POST",
			headers: { "content-type": ct },
			body,
			cache: "no-store",
		});

		// DO NOT parse/transform here. Just return upstream as-is.
		const text = await upstream.text();
		return new Response(text, {
			status: upstream.status,
			headers: {
				"content-type":
					upstream.headers.get("content-type") ?? "application/json",
			},
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: "Internal Server Error",
				details: (error as Error).message,
			}),
			{ status: 500, headers: { "content-type": "application/json" } }
		);
	}
}
