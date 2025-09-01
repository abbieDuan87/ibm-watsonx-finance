"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMsg } from "../types/chat";
import { analyzeText } from "@/lib/api";

const GREETING =
	"Hi, I’m your financial assistant. Ask about cash flow, margins, runway, or upload a report (PDF/CSV/XLSX) and I’ll analyse it.";

// Shape your backend (and model fallback) might return
type AIAPIData = {
	result?: string;
	insight?: string;
	raw?: string;
	choices?: Array<{ message?: { content?: string } }>;
	error?: string;
};

// If you want to type analyzeText’s return minimally:
type AnalyzeResponse = {
	ok: boolean;
	status: number;
	data: AIAPIData;
};

export function formatAIMessage(message: string): string[] {
	if (!message) return [];
	const lines = message
		.split(/\n|\s*-\s+/)
		.map((line) => line.trim())
		.filter(Boolean);
	return lines;
}

type UseChatProps = {
	chatHistory?: ChatMsg[];
	setChatHistory?: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
	extractedText?: string;
};

function unwrapAIMessage(data: unknown): string {
	if (data && typeof data === "object") {
		const d = data as AIAPIData;
		return (
			d.result ?? d.insight ?? d.choices?.[0]?.message?.content ?? d.raw ?? ""
		);
	}
	if (typeof data === "string") return data;
	return "";
}

export function useChat(props?: UseChatProps) {
	const [internalHistory, internalSetHistory] = useState<ChatMsg[]>([]);
	const chatHistory = props?.chatHistory ?? internalHistory;
	const setChatHistory = props?.setChatHistory ?? internalSetHistory;
	const [chatInput, setChatInput] = useState("");
	const [chatLoading, setChatLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const extractedText = props?.extractedText ?? "";

	// Seed greeting once after hydration (only if history is empty)
	useEffect(() => {
		setChatHistory((prev) =>
			prev.length ? prev : [{ role: "ai", message: GREETING }]
		);
	}, [setChatHistory]);

	// Auto scroll
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [chatHistory]);

	const sendMessage = async (text?: string) => {
		const content = (text ?? chatInput).trim();
		if (!content || chatLoading) return;

		setChatHistory((prev) => [...prev, { role: "user", message: content }]);
		setChatInput("");
		setChatLoading(true);

		const prompt = extractedText
			? `Given the following uploaded data:\n${extractedText}\n\nUser question: ${content}`
			: content;

		try {
			const res = (await analyzeText(prompt)) as AnalyzeResponse; // narrow once here
			const aiMsg = unwrapAIMessage(res.data) || "No response from Watsonx.";

			if (!res.ok) {
				setChatHistory((prev) => [
					...prev,
					{ role: "ai", message: res.data?.error ?? aiMsg },
				]);
				console.warn("[useChat] analyzeText non-200:", res.status, res.data);
			} else {
				setChatHistory((prev) => [...prev, { role: "ai", message: aiMsg }]);
			}
		} catch (e: unknown) {
			console.error("[useChat] analyzeText error:", e);
			setChatHistory((prev) => [
				...prev,
				{ role: "ai", message: "Failed to connect to Watsonx." },
			]);
		} finally {
			setChatLoading(false);
		}
	};

	return {
		chatHistory,
		chatInput,
		setChatInput,
		chatLoading,
		sendMessage,
		scrollRef,
	};
}
