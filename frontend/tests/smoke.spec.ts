// frontend/tests/smoke.spec.ts
import { test, expect } from "@playwright/test";
import path from "path";

test("upload → analyze → basic chat reply", async ({ page }) => {
	await page.goto("/upload-test");

	// Set up network mocks BEFORE clicking
	await page.route("**/api/upload", async (route) => {
		// basic check the request is multipart/form-data
		const headers = route.request().headers();
		if (
			!("content-type" in headers) ||
			!headers["content-type"]!.includes("multipart/form-data")
		) {
			return route.abort();
		}
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				extracted_text: "Cash in 7700; out 1380; net 6320.",
			}),
		});
	});

	await page.route("**/api/analyze", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				insight: "Net positive cash flow with major inflows from invoices.",
				raw: "Net positive cash flow with major inflows from invoices.",
			}),
		});
	});

	// Attach the CSV to the hidden input exposed via data-testid
	const csvPath = path.resolve(__dirname, "./fixtures/clean_cashflow.csv");
	await page.getByTestId("file-input").setInputFiles(csvPath);

	// Click the button
	await page.getByRole("button", { name: /upload\s*&\s*analyze/i }).click();

	// Expect the mocked insight panel to render
	await expect(page.getByTestId("analysis-result")).toBeVisible({
		timeout: 15_000,
	});
	await expect(page.getByText(/Net positive cash flow/i)).toBeVisible();
});
