import { test, expect } from "@playwright/test";
import path from "path";

test("rejects PNG (unsupported) and makes no upload/analyze calls", async ({
	page,
}) => {
	await page.goto("/upload-test"); // or the route where UploadArea renders

	// Watch for any backend calls; we expect none for a rejected file
	const seenRequests: string[] = [];
	page.on("request", (req) => {
		const url = req.url();
		if (/\/api\/(upload|analyze)\b/i.test(url)) {
			seenRequests.push(`${req.method()} ${url}`);
		}
	});

	// Try to attach a PNG (unsupported)
	const pngPath = path.resolve(__dirname, "./fixtures/sample.png");
	const fileInput = page.getByTestId("file-input");
	await fileInput.setInputFiles(pngPath);

	// UI should NOT show a "Selected file:" line because dropzone rejected it
	await expect(page.getByText(/Selected file:/i)).toHaveCount(0);

	// Click Upload & Analyze anyway; handler should early-return (no file)
	await page.getByRole("button", { name: /upload\s*&\s*analyze/i }).click();

	// Give a short moment; verify no upload/analyze requests happened
	await page.waitForTimeout(300);
	expect(
		seenRequests,
		`Unexpected calls:\n${seenRequests.join("\n")}`
	).toHaveLength(0);

	// Default prompt (or your rejection message) should be visible
	// If you added the friendly message in onDrop, assert that instead:
	const rejectionMsg = page.getByText(/unsupported file type|pdf|csv|xlsx/i);
	const defaultPrompt = page.getByText(
		/drag\s*&?\s*drop a file here, or click to select a file/i
	);
	await expect(rejectionMsg.or(defaultPrompt)).toBeVisible();
});
