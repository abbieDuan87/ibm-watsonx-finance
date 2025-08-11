"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadPage() {
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<string>("");
	const [insight, setInsight] = useState<string>("");
	const [chatInput, setChatInput] = useState("");
	const [chatHistory, setChatHistory] = useState<
		{ role: "user" | "ai"; message: string }[]
	>([]);
	const [loading, setLoading] = useState(false);

	const onDrop = (acceptedFiles: File[]) => {
		if (acceptedFiles && acceptedFiles.length > 0) {
			setFile(acceptedFiles[0]);
			setResult("");
			setInsight("");
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: [
			"image/jpeg",
			"image/png",
			"text/csv",
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			".xlsx",
		],
		multiple: false,
		onDrop,
	});

	const handleUpload = async () => {
		if (!file) return;
		setLoading(true);
		setInsight("");
		try {
			const form = new FormData();
			form.append("file", file);

			// 1) Send file to Next.js API route for OCR/parsing
			const res = await fetch("/api/upload", {
				method: "POST",
				body: form,
			});
			const data = await res.json();
			const extracted =
				data.extracted_text || data.error || "No text extracted.";
			setResult(extracted);

			// 2) Auto-analyze the extracted text with Granite
			if (data.extracted_text) {
				const analyzeForm = new FormData();
				analyzeForm.append("text", extracted);
				const ai = await fetch("/api/analyze", {
					method: "POST",
					body: analyzeForm,
				});
				const aiData = await ai.json();
				setInsight(aiData.insight || "No response from Watsonx.");
				setChatHistory((prev) => [
					...prev,
					{ role: "user", message: "Analyze the uploaded report." },
					{
						role: "ai",
						message: aiData.insight || "No response from Watsonx.",
					},
				]);
			}
		} catch (err) {
			console.error("Upload/analyze error:", err);
			setResult("Failed to process file.");
		} finally {
			setLoading(false);
		}
	};

	// Chat stays for ad-hoc questions after the auto analysis
	const handleChatSend = async () => {
		if (!chatInput.trim()) return;
		setChatHistory((prev) => [...prev, { role: "user", message: chatInput }]);
		try {
			const formData = new FormData();
			formData.append("text", chatInput);
			const res = await fetch("/api/analyze", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			setChatHistory((prev) => [
				...prev,
				{ role: "ai", message: data.insight || "No response from Watsonx." },
			]);
		} catch (err) {
			console.error("Watsonx error:", err);
			setChatHistory((prev) => [
				...prev,
				{ role: "ai", message: "Failed to connect to Watsonx." },
			]);
		}
		setChatInput("");
	};

	return (
		<main className="p-6 space-y-4">
			<h2 className="text-xl font-semibold">Upload Report</h2>

			{/* Drag and Drop Area */}
			<div
				{...getRootProps()}
				className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
					isDragActive
						? "border-primary bg-primary/10"
						: "border-base-300 bg-base-100"
				}`}
			>
				<input {...getInputProps({ refKey: "ref" })} />
				{file ? (
					<p className="text-success">Selected file: {file.name}</p>
				) : isDragActive ? (
					<p>Drop the file here ...</p>
				) : (
					<p>Drag & drop a file here, or click to select a file</p>
				)}
			</div>

			<button
				onClick={handleUpload}
				className="btn btn-primary"
				disabled={loading}
			>
				{loading ? "Processing..." : "Upload & Analyze"}
			</button>

			{insight && (
				<div className="mt-4 p-4 bg-blue-50 border rounded">
					<h3 className="font-semibold mb-2">Watsonx Insights:</h3>
					<pre className="whitespace-pre-wrap">{insight}</pre>
				</div>
			)}

			{/* Chat Window */}
			<div className="mt-8 card bg-base-100 shadow-md">
				<div className="card-body">
					<h3 className="font-title text-lg mb-2">Chat with Watsonx</h3>
					<div className="h-48 overflow-y-auto mb-4 border rounded p-2 bg-base-200">
						{chatHistory.length === 0 && (
							<p className="text-base-content/60">No messages yet.</p>
						)}
						{chatHistory.map((msg, idx) => (
							<div
								key={idx}
								className={`mb-2 ${
									msg.role === "user" ? "text-right" : "text-left"
								}`}
							>
								<span
									className={`inline-block px-3 py-1 rounded ${
										msg.role === "user"
											? "bg-primary text-primary-content"
											: "bg-secondary text-secondary-content"
									}`}
								>
									{msg.message}
								</span>
							</div>
						))}
					</div>
					<div className="flex gap-2">
						<input
							type="text"
							className="input input-bordered flex-1"
							placeholder="Ask follow-up questions..."
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleChatSend();
							}}
						/>
						<button className="btn btn-primary" onClick={handleChatSend}>
							Send
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
