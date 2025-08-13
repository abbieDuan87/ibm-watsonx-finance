export type Role = "user" | "ai";

export type ChatMsg = {
	role: Role;
	message: string;
};
