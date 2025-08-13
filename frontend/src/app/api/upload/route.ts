export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const base = process.env.BACKEND_BASE_URL || "http://127.0.0.1:8000";
	const path = process.env.BACKEND_UPLOAD_PATH || "/api/upload";
	const body = await req.text();
	const ct = req.headers.get("content-type") || "application/json";

	const r = await fetch(`${base}${path}`, {
		method: "POST",
		headers: { "content-type": ct },
		body,
		cache: "no-store",
	});

	const text = await r.text();
	return new Response(text, {
		status: r.status,
		headers: {
			"content-type": r.headers.get("content-type") ?? "application/json",
		},
	});
}
