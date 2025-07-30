"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { parseCSV, parsePDF, parseExcel } from "@/utils/parsers";

export default function UploadPage() {
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<string>("");
	const [chatInput, setChatInput] = useState("");
	const [chatHistory, setChatHistory] = useState<
		{ role: "user" | "ai"; message: string }[]
	>([]);

	const onDrop = (acceptedFiles: File[]) => {
		if (acceptedFiles && acceptedFiles.length > 0) {
			setFile(acceptedFiles[0]);
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
	});

	const handleUpload = async () => {
		if (!file) return;

		const type = file.type;
		let output: string | any[] = "Unsupported file format.";

		try {
			if (type === "text/csv") {
				output = await parseCSV(file);
			} else if (type === "application/pdf") {
				output = await parsePDF(file);
			} else if (
				type ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				output = await parseExcel(file);
			} else if (file.name.endsWith(".xlsx")) {
				// fallback for browsers that don't detect Excel MIME type correctly
				output = await parseExcel(file);
			} else {
				output = "Unsupported file type.";
			}
		} catch (err) {
			console.error("Parsing error:", err);
			output = "Failed to parse file.";
		}

		if (typeof output === "string") {
			setResult(output);
		} else {
			setResult(JSON.stringify(output, null, 2));
		}
	};

	const handleChatSend = async () => {
		if (!chatInput.trim()) return;
		setChatHistory((prev) => [...prev, { role: "user", message: chatInput }]);

		try {
			const formData = new FormData();
			formData.append("text", chatInput);

			const res = await fetch("http://localhost:8000/analyze", {
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

			<button onClick={handleUpload} className="btn btn-primary">
				Upload
			</button>

			{result && (
				<div className="mt-4 p-4 bg-gray-100 border rounded">
					<h3 className="font-semibold mb-2">Summary:</h3>
					<p>{result}</p>
				</div>
			)}

			{/* Chat Window */}
			<div className="mt-8 card bg-base-100 shadow-md">
				<div className="card-body">
					<h3 className="font-title text-lg mb-2">Chat with WatsonX</h3>
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
							placeholder="Type your question..."
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
