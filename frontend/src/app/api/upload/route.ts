export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const base = process.env.BACKEND_BASE_URL || "http://127.0.0.1:8000";
	const path = process.env.BACKEND_UPLOAD_PATH || "/api/upload";
	const inForm = await req.formData();
	const outForm = new FormData();
	for (const [key, value] of inForm.entries()) {
		if (value instanceof File) {
			outForm.append(key, value, value.name);
		} else {
			outForm.append(key, value as string);
		}
	}
	const r = await fetch(`${base}${path}`, {
		method: "POST",
		body: outForm,
		cache: "no-store",
	});

	return new Response(r.body, {
		status: r.status,
		headers: {
			"content-type": r.headers.get("content-type") ?? "text/plain",
		},
	});
}
