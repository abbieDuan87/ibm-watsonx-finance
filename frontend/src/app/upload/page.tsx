"use client";

import { useState } from "react";
import type { ChatMsg } from "@/types/chat";
import UploadArea from "../components/UploadArea";
import ChatWindow from "../components/ChatWindow";

export default function UploadPage() {
	const [chatHistory, setChatHistory] = useState<ChatMsg[]>([
		{
			role: "ai",
			message:
				"Hi, I’m your financial assistant. Ask about cash flow, margins, runway, or upload a report (PDF/CSV/XLSX) and I’ll analyse it.",
		},
	]);

	const [extractedText, setExtractedText] = useState<string>("");

	return (
		<main className="p-6 space-y-8">
			<UploadArea
				onChatPair={(userMsg: string, aiMsg: string) => {
					setChatHistory((prev) => [
						...prev,
						{ role: "user", message: userMsg },
						{ role: "ai", message: aiMsg },
					]);
				}}
				onExtractedText={setExtractedText}
			/>
			<ChatWindow
				chatHistory={chatHistory}
				setChatHistory={setChatHistory}
				extractedText={extractedText}
			/>
		</main>
	);
}
