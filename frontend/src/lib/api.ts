const ANALYZE = "/api/analyze";
const UPLOAD = "/api/upload";

async function safeJson(res: Response) {
	const text = await res.text();
	try {
		return JSON.parse(text);
	} catch {
		return { raw: text };
	}
}

export async function analyzeText(text: string) {
	const res = await fetch(ANALYZE, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text }),
	});
	const data = await safeJson(res);
	const insight =
		data?.insight ?? // if backend ever changes
		data?.result ?? // current backend key
		data?.choices?.[0]?.message?.content ??
		data?.raw ??
		null;

	return { ok: res.ok, status: res.status, data: { ...data, insight } };
}

export async function uploadFile(file: File) {
	const form = new FormData();
	form.append("file", file);
	const res = await fetch(UPLOAD, { method: "POST", body: form });
	const data = await safeJson(res);
	return { ok: res.ok, status: res.status, data };
}
