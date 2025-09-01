import { test, expect } from "@playwright/test";
import path from "path";

test("CSV upload → analyze shows insights", async ({ page }) => {
	await page.goto("/upload-test");

	// Mock both endpoints (relative or absolute)
	await page.route(/.*\/api\/upload$/i, async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				extracted_text: "CSV parsed: inflows 7700; outflows 1380; net 6320.",
			}),
		});
	});
	await page.route(/.*\/api\/analyze$/i, async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				insight: "Net positive cash flow (CSV). Major inflows from invoices.",
				raw: "Net positive cash flow (CSV). Major inflows from invoices.",
			}),
		});
	});

	const csvPath = path.resolve(__dirname, "./fixtures/clean_cashflow.csv");
	await page.getByTestId("file-input").setInputFiles(csvPath);

	const [res1, res2] = await Promise.all([
		page.waitForResponse(/\/api\/upload$/i),
		page.waitForResponse(/\/api\/analyze$/i),
		page.getByRole("button", { name: /upload\s*&\s*analyze/i }).click(),
	]);
	expect([res1.status(), res2.status()].every((s) => s === 200)).toBeTruthy();

	await expect(page.getByTestId("analysis-result")).toBeVisible({
		timeout: 15_000,
	});
	await expect(page.getByText(/net positive cash flow \(csv\)/i)).toBeVisible();
});
