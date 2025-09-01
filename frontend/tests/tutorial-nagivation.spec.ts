import { test, expect } from "@playwright/test";

test("navigating steps updates content and progress", async ({ page }) => {
	await page.goto("/tutorial");

	// Initial: Step 1 content visible
	await expect(
		page.getByRole("heading", { name: /welcome & learning outcomes/i })
	).toBeVisible();

	// Read initial progress value from the <progress> element
	const progress = page.locator("progress.progress");
	await expect(progress).toBeVisible();
	const startVal = parseFloat((await progress.getAttribute("value")) || "0");

	// Click step 3: "Core workflow in Studio"
	await page
		.getByRole("button", { name: /3\s+core workflow in studio/i })
		.click();
	await expect(
		page.getByRole("heading", { name: /core workflow in studio/i })
	).toBeVisible();

	// Progress should have increased
	const afterVal = parseFloat((await progress.getAttribute("value")) || "0");
	expect(afterVal).toBeGreaterThan(startVal);

	// Jump to step 5 and verify content changes again
	await page.getByRole("button", { name: /5\s+deployments & apis/i }).click();
	await expect(
		page.getByRole("heading", { name: /deployments & apis/i })
	).toBeVisible();
});
