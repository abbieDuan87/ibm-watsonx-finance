import type { Role } from "../../types/chat";

export default function MessageBubble({
	role,
	children,
}: {
	role: Role;
	children: React.ReactNode;
}) {
	const isUser = role === "user";
	return (
		<div className={`mb-4 ${isUser ? "text-right" : "text-left"}`}>
			<span
				className={`inline-block px-3 py-1 rounded ${
					isUser
						? "bg-primary text-primary-content"
						: "bg-secondary text-secondary-content"
				}`}
			>
				{children}
			</span>
		</div>
	);
}
