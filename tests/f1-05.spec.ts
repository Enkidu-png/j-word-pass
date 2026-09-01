import { test, expect } from "@playwright/test";

test("kursor komisji z jawnym hotspotem na html i na elementach klikalnych", async ({ page }) => {
  await page.goto("/dev/scena");
  const html = await page.evaluate(() => getComputedStyle(document.documentElement).cursor);
  expect(html).toContain("/assets/kursor.gif");
  expect(html).toContain("4 2");
  const przycisk = await page.evaluate(
    () => getComputedStyle(document.querySelector("button")!).cursor,
  );
  expect(przycisk).toContain("/assets/kursor-rece.gif");
  expect(przycisk).toContain("8 2");
});
