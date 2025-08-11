import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const formData = await req.formData();
	const backendRes = await fetch("http://127.0.0.1:8000/upload", {
		method: "POST",
		body: formData,
	});
	const data = await backendRes.text();
	return new Response(data, {
		status: backendRes.status,
		headers: {
			"content-type":
				backendRes.headers.get("content-type") || "application/json",
		},
	});
}
