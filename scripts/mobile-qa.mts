/**
 * Mobile QA at 375×812 — demo org result screenshots + layout checks.
 * Run: npx tsx scripts/mobile-qa.mts
 * Requires: next dev on :3456, playwright chromium installed.
 */
import { chromium, type Page } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3456";
const OUT = path.join(process.cwd(), "scripts", "mobile-qa-out");

async function measure(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      overflowX: style.overflowX,
      text: (el.textContent ?? "").slice(0, 80),
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      truncated: el.scrollWidth > el.clientWidth + 1,
    };
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  // Load demo → personal → org
  await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
  await page.waitForURL(/\/result\/personal/, { timeout: 15000 });
  await page.goto(`${BASE}/result/org`, { waitUntil: "networkidle" });
  await page.waitForSelector("#friction-map", { timeout: 10000 });

  // Friction Map screenshot
  const map = page.locator("#friction-map");
  await map.scrollIntoViewIfNeeded();
  await map.screenshot({ path: path.join(OUT, "friction-map-375.png") });

  // Check factor names for truncation
  const names = page.locator("#friction-map button span.break-keep, #friction-map button span.font-medium");
  const nameCount = await names.count();
  const nameIssues: string[] = [];
  for (let i = 0; i < Math.min(nameCount, 10); i++) {
    const el = names.nth(i);
    const box = await el.boundingBox();
    const text = (await el.textContent())?.trim() ?? "";
    if (!text || text.length < 2) continue;
    const truncated = await el.evaluate((n) => {
      // text-overflow ellipsis or scrollWidth overflow
      const s = getComputedStyle(n);
      return (
        s.textOverflow === "ellipsis" ||
        n.scrollWidth > n.clientWidth + 2
      );
    });
    if (truncated) nameIssues.push(text);
  }

  // Diagnosis line height
  const diag = page.locator("#friction-map p").first();
  const diagBox = await diag.boundingBox();
  const diagText = (await diag.textContent()) ?? "";

  // Open first factor sheet
  await page.locator("#friction-map button").first().click();
  await page.waitForTimeout(400);
  const sheet = page.locator('[data-slot="sheet-content"]');
  const sheetVisible = await sheet.isVisible().catch(() => false);
  let sheetScrollable = false;
  if (sheetVisible) {
    await sheet.screenshot({ path: path.join(OUT, "friction-sheet-375.png") });
    sheetScrollable = await sheet.evaluate((el) => {
      const body = el.querySelector(".overflow-y-auto") ?? el;
      return body.scrollHeight >= body.clientHeight;
    });
  }
  // Close sheet
  if (sheetVisible) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  // Action cards
  const actions = page.locator("#action-cards");
  await actions.scrollIntoViewIfNeeded();
  await actions.screenshot({
    path: path.join(OUT, "action-cards-375.png"),
  });

  // Full page tall screenshot of map+actions region
  await page.screenshot({
    path: path.join(OUT, "org-full-375.png"),
    fullPage: true,
  });

  // Check horizontal overflow on body
  const bodyOverflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));

  // Card column count (should be 1 at 375)
  const gridCols = await page
    .locator("#action-cards > div.grid")
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns);

  const report = {
    viewport: "375x812",
    bodyOverflow,
    factorNameTruncationIssues: nameIssues,
    diagnosisLine: {
      chars: diagText.length,
      heightPx: diagBox ? Math.round(diagBox.height) : null,
      preview: diagText.slice(0, 100),
    },
    sheetVisible,
    sheetScrollable,
    actionGridColumns: gridCols,
  };

  fs.writeFileSync(
    path.join(OUT, "report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
  console.log("screenshots →", OUT);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
