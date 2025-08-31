export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const base = process.env.BACKEND_BASE_URL || "http://127.0.0.1:8000";
	const path = process.env.BACKEND_UPLOAD_PATH || "/api/upload";

	// Read multipart form data (keeps file bytes intact)
	const inForm = await req.formData();

	// Rebuild a fresh FormData to send downstream
	const outForm = new FormData();
	for (const [key, value] of inForm.entries()) {
		if (value instanceof File) {
			// preserve filename and type
			outForm.append(key, value, value.name);
		} else {
			outForm.append(key, value as string);
		}
	}

	// IMPORTANT: don't set content-type; fetch will add the correct multipart boundary
	const r = await fetch(`${base}${path}`, {
		method: "POST",
		body: outForm,
		cache: "no-store",
	});

	// Stream back the response as-is
	return new Response(r.body, {
		status: r.status,
		headers: {
			"content-type": r.headers.get("content-type") ?? "text/plain",
		},
	});
}
