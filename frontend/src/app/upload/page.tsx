"use client";

import { useState } from "react";

export default function UploadPage() {
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<string>("");

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch("http://localhost:8000/api/upload", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			setResult(data.summary || "No result returned.");
		} catch (err) {
			setResult("Upload failed.");
			console.error(err);
		}
	};

	return (
		<main className="p-6 space-y-4">
			<h2 className="text-xl font-semibold">Upload Report</h2>

			<input type="file" className="file-input" onChange={handleFileChange} />
			<button onClick={handleUpload} className="btn btn-primary">
				Upload
			</button>

			{result && (
				<div className="mt-4 p-4 bg-gray-100 border rounded">
					<h3 className="font-semibold mb-2">Summary:</h3>
					<p>{result}</p>
				</div>
			)}
		</main>
	);
}
