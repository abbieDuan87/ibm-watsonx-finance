import { test, expect } from "@playwright/test";

test("resources section exposes valid external links", async ({ page }) => {
	await page.goto("/tutorial");

	// Click sidebar step 9: "Resources & Links"
	await page
		.getByRole("button", { name: /9\s+resources\s*&\s*links/i })
		.click();

	// Scope to the SectionCard that has the heading "Useful Resources & Links"
	const section = page
		.getByRole("heading", { name: /useful resources & links/i })
		.locator("..") // card-body
		.locator(".."); // card

	await expect(section).toBeVisible();

	// Only links inside this section’s list
	const links = section.locator("ul li a");
	const count = await links.count();
	expect(count).toBeGreaterThan(0);

	for (let i = 0; i < count; i++) {
		const link = links.nth(i);
		const href = await link.getAttribute("href");

		// Resources list should be external links
		expect(href, `Unexpected href on resources link #${i}`).toMatch(
			/^https?:\/\//
		);

		// Good external-link hygiene
		await expect(link).toHaveAttribute("target", "_blank");
		const text = (await link.textContent())?.trim() || "";
		expect(text.length).toBeGreaterThan(0);
	}
});
