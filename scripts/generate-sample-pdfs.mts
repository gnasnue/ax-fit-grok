/**
 * Generate high/low friction executive PDFs for quality review.
 * Run: npx tsx scripts/generate-sample-pdfs.mts
 */
import { writeFileSync, mkdirSync, existsSync, createWriteStream } from "node:fs";
import path from "node:path";
import React from "react";
import { Font, pdf } from "@react-pdf/renderer";
import { calculateResults } from "../src/lib/scoring";
import { ExecutiveReportDocument } from "../src/components/report/ReportPDF";

const fontDir = path.join(process.cwd(), "public", "fonts");
const regular = path.join(fontDir, "NotoSansKR-Regular.otf");
const bold = path.join(fontDir, "NotoSansKR-Bold.otf");

if (!existsSync(regular) || !existsSync(bold)) {
  throw new Error("Missing NotoSansKR fonts in public/fonts.");
}

// Register on the same Font singleton used by layout (must run before pdf())
Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: regular, fontWeight: 400 },
    { src: bold, fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((word) => [word]);
console.log("fonts:", Font.getRegisteredFontFamilies());

const outDir = path.join(process.cwd(), "scripts", "pdf-samples");
mkdirSync(outDir, { recursive: true });

const highMgr = {
  M1: 1,
  M2: "time",
  M3: 1,
  M4: 5,
  M5: 1,
  M6: 1,
  M7: 1,
  M8: 1,
  M9: 5,
  M10: "metrics",
};

const lowMgr = {
  M1: 5,
  M2: "howto",
  M3: 5,
  M4: 1,
  M5: 5,
  M6: 5,
  M7: 5,
  M8: 5,
  M9: 1,
  M10: "tools",
};

async function toNodeBuffer(
  element: React.ReactElement,
): Promise<Buffer> {
  const instance = pdf(element);
  // v4: toBuffer may return a stream or Buffer depending on environment
  const result = await instance.toBuffer();
  if (Buffer.isBuffer(result)) return result;
  if (result instanceof Uint8Array) return Buffer.from(result);

  // Node stream
  const stream = result as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    stream.on("data", (c: Buffer) => chunks.push(Buffer.from(c)));
    stream.on("end", () => resolve());
    stream.on("error", reject);
  });
  return Buffer.concat(chunks);
}

async function writeSample(
  name: string,
  result: ReturnType<typeof calculateResults>,
  companyLabel: string,
) {
  const element = React.createElement(ExecutiveReportDocument, {
    report: result.org.executiveReport,
    companyLabel,
  });
  const buffer = await toNodeBuffer(element);
  const file = path.join(outDir, name);
  writeFileSync(file, buffer);
  console.log("wrote", file, `(${(buffer.length / 1024).toFixed(1)} KB)`);
  console.log(
    "  headline:",
    result.org.executiveReport.headline.slice(0, 90) + "…",
  );
}

const high = calculateResults({
  context: {
    industry: "manufacturing",
    size: "300_1000",
    axStage: "education_tools",
    axOwner: "hr",
  },
  role: "manager",
  answers: highMgr,
  allLayers: {
    executive: {
      E1: 4,
      E2: "productivity",
      E3: ["manager_attitude", "no_goal"],
      E4: 2,
      E5: 2,
      E6: 4,
      E7: "training",
      E8: "eval",
    },
    manager: highMgr,
    staff: {
      S1: 2,
      S2: "howto",
      S3: 2,
      S4: 2,
      S5: 2,
      S6: 4,
      S7: 3,
      S8: "time",
      S9: 2,
      S10: "eval",
    },
  },
});

const low = calculateResults({
  context: {
    industry: "it_platform",
    size: "1000_2000",
    axStage: "partial_apply",
    axOwner: "tft",
  },
  role: "manager",
  answers: lowMgr,
  allLayers: { manager: lowMgr },
});

await writeSample("high-friction-exec.pdf", high, "제조 · 300~1,000명");
await writeSample("low-friction-exec.pdf", low, "IT·플랫폼 · 1,000~2,000명");
console.log("done → scripts/pdf-samples/");
