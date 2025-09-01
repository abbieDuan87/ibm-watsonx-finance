import { test, expect } from "@playwright/test";

test("knowledge check 1: shows per-question feedback and score", async ({
	page,
}) => {
	await page.goto("/tutorial");

	// Go to step 8: "Knowledge Checks & Completion"
	await page
		.getByRole("button", { name: /8\s+knowledge checks & completion/i })
		.click();
	await expect(
		page.getByRole("heading", { name: /knowledge check 1 — concepts/i })
	).toBeVisible();

	// Scope to the KC1 card (two parent hops from the heading)
	const kc1 = page
		.getByRole("heading", { name: /knowledge check 1 — concepts/i })
		.locator("..")
		.locator("..");

	// Q1 correct: "No"
	await kc1.getByRole("radio", { name: /^no$/i }).check();

	// Q2 correct: "RAG with a Vector Index"
	await kc1.getByRole("radio", { name: /rag with a vector index/i }).check();

	// Submit
	await kc1.getByRole("button", { name: /check answers/i }).click();

	// Expect exactly two feedback blocks (one per question)
	const feedbacks = kc1.locator("div.mt-3.text-sm");
	await expect(feedbacks).toHaveCount(2);

	// And the score 2/2 is shown
	await expect(kc1.getByText(/score:\s*2\/2/i)).toBeVisible();
});
