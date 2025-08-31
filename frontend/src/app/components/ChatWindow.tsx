"use client";

import MessageBubble from "./MessageBubble";
import { useChat, formatAIMessage } from "@/hooks/useChat";

export default function ChatWindow() {
	const {
		chatHistory,
		chatInput,
		setChatInput,
		chatLoading,
		sendMessage,
		scrollRef,
	} = useChat();

	return (
		<div className="mt-8 card bg-base-100 shadow-md">
			<div className="card-body">
				<h3 className="font-title text-lg mb-2">Chat with Watsonx</h3>

				<div
					ref={scrollRef}
					className="h-[32rem] overflow-y-auto mb-4 border rounded p-2 bg-base-200"
				>
					{chatHistory.length === 0 ? (
						<p className="text-base-content/60">No messages yet.</p>
					) : (
						chatHistory.map((m, i) => {
							if (m.role === "ai") {
								const lines = formatAIMessage(m.message);
								return (
									<MessageBubble
										key={`${i}-${m.role}-${m.message.slice(0, 8)}`}
										role={m.role}
									>
										<div className="text-left">
											{lines.map((line, idx) => (
												<div key={idx}>{line}</div>
											))}
										</div>
									</MessageBubble>
								);
							} else {
								return (
									<MessageBubble
										key={`${i}-${m.role}-${m.message.slice(0, 8)}`}
										role={m.role}
									>
										{m.message}
									</MessageBubble>
								);
							}
						})
					)}
				</div>

				<div className="flex gap-2">
					<input
						type="text"
						className="input input-bordered flex-1"
						placeholder="Chat with WatsonX, your financial assistant..."
						value={chatInput}
						onChange={(e) => setChatInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") sendMessage();
						}}
						disabled={chatLoading}
					/>
					<button
						className="btn btn-primary"
						onClick={() => sendMessage()}
						disabled={chatLoading}
					>
						{chatLoading ? "Thinking…" : "Send"}
					</button>
				</div>
			</div>
		</div>
	);
}
