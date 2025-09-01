"use client";

import { useState } from "react";
import { useDropzone, type Accept, type DropzoneOptions } from "react-dropzone";
import { analyzeText, uploadFile } from "@/lib/api";

export default function UploadArea({
	onInsight,
	onChatPair, // optional: push auto-analysis Q/A into chat
	onExtractedText, // new prop to lift extracted text up
}: {
	onInsight?: (text: string) => void;
	onChatPair?: (userMsg: string, aiMsg: string) => void;
	onExtractedText?: (text: string) => void;
}) {
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState("");
	const [insight, setInsight] = useState("");
	const [loading, setLoading] = useState(false);

	const accept: Accept = {
		"image/*": [".jpeg", ".jpg", ".png"],
		"text/csv": [".csv"],
		"application/pdf": [".pdf"],
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
			".xlsx",
		],
	};

	const onDrop = (acceptedFiles: File[]) => {
		if (acceptedFiles.length) setFile(acceptedFiles[0]);
	};

	const options: DropzoneOptions = {
		accept,
		multiple: false,
		onDrop,
		onDragEnter: () => {},
		onDragOver: () => {},
		onDragLeave: () => {},
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone(options);

	const handleUpload = async () => {
		if (!file) return;
		setLoading(true);
		setInsight("");
		try {
			// 1) Upload + OCR/parse
			const { ok, data } = await uploadFile(file);
			if (!ok) {
				setResult(data?.error ?? "Upload failed.");
				return;
			}
			const extracted =
				data.extracted_text || data.error || "No text extracted.";
			setResult(extracted);

			// Pass extracted text up for chat context
			onExtractedText?.(extracted);

			// 2) Auto-analyse if we have text
			if (data.extracted_text) {
				const res = await analyzeText(extracted);
				const msg = res.ok
					? res.data.insight || res.data.raw || "No response from Watsonx."
					: res.data?.error ?? res.data?.raw ?? "Watsonx error.";
				setInsight(msg);
				onInsight?.(msg);
				onChatPair?.("Analyze the uploaded report.", msg);
			}
		} catch {
			setResult("Failed to process file.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="space-y-4" data-testid="upload-section">
			<h2 className="text-xl font-semibold">Upload Report</h2>

			<div
				{...getRootProps()}
				data-testid="dropzone"
				className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
					isDragActive
						? "border-primary bg-primary/10"
						: "border-base-300 bg-base-100"
				}`}
			>
				<input {...getInputProps()} data-testid="file-input" />
				{file ? (
					<p className="text-success">Selected file: {file.name}</p>
				) : isDragActive ? (
					<p>Drop the file here ...</p>
				) : (
					<p>Drag & drop a file here, or click to select a file</p>
				)}
			</div>

			<button
				className="btn btn-primary"
				onClick={handleUpload}
				disabled={loading}
			>
				{loading ? "Processing..." : "Upload & Analyze"}
			</button>

			{insight && (
				<div
					className="mt-4 p-4 bg-blue-50 border rounded"
					data-testid="analysis-result"
				>
					<h3 className="font-semibold mb-2">Watsonx Insights:</h3>
					<pre className="whitespace-pre-wrap">{insight}</pre>
				</div>
			)}

			{result && (
				<details className="mt-2">
					<summary className="cursor-pointer">Extracted text</summary>
					<pre className="whitespace-pre-wrap p-2 bg-base-200 rounded mt-2">
						{result}
					</pre>
				</details>
			)}
		</section>
	);
}
