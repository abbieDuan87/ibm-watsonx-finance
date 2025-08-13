"use client";

import ChatWindow from "../components/ChatWindow";
import UploadArea from "../components/UploadArea";

export default function UploadPage() {
	return (
		<main className="p-6 space-y-8">
			<UploadArea
				// Optional wiring if you want the auto-analysis to also appear in chat:
				onChatPair={(userMsg, aiMsg) => {
					// You can expose a chat context to push messages if needed.
					// For now, this is a no-op placeholder to show the seam.
					// Option A: lift chat state up or use a Zustand/Context store.
					console.debug("Auto-chat:", userMsg, aiMsg);
				}}
			/>
			<ChatWindow />
		</main>
	);
}
