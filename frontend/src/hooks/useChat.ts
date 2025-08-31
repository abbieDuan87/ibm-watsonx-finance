"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMsg } from "../types/chat";
import { analyzeText } from "@/lib/api";

const GREETING =
	"Hi, I’m your financial assistant. Ask about cash flow, margins, runway, or upload a report (PDF/CSV/XLSX) and I’ll analyse it.";

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

export function useChat(props?: UseChatProps) {
	const [internalHistory, internalSetHistory] = useState<ChatMsg[]>([]);
	const chatHistory = props?.chatHistory ?? internalHistory;
	const setChatHistory = props?.setChatHistory ?? internalSetHistory;
	const [chatInput, setChatInput] = useState("");
	const [chatLoading, setChatLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const extractedText = props?.extractedText ?? "";

	// Seed greeting once after hydration
	useEffect(() => {
		setChatHistory([{ role: "ai", message: GREETING }]);
	}, [setChatHistory]);

	// Auto scroll
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [chatHistory]);

	const unwrapAIMessage = (data: any): string => {
		// Prefer backend's `result`, then `insight`, then common watsonx shape, then raw
		return (
			data?.result ??
			data?.insight ??
			data?.choices?.[0]?.message?.content ??
			data?.raw ??
			""
		);
	};

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
			const { ok, status, data } = await analyzeText(prompt);
			const aiMsg = unwrapAIMessage(data) || "No response from Watsonx.";

			if (!ok) {
				setChatHistory((prev) => [
					...prev,
					{ role: "ai", message: data?.error ?? aiMsg },
				]);
				// Optional: console hint for debugging
				console.warn("[useChat] analyzeText non-200:", status, data);
			} else {
				setChatHistory((prev) => [...prev, { role: "ai", message: aiMsg }]);
			}
		} catch (e) {
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
