import { Font, pdf, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import React from "react";
import path from "node:path";
import fs from "node:fs";

const p = path.join(process.cwd(), "public/fonts/NotoSansKR-Regular.otf");
const b = path.join(process.cwd(), "public/fonts/NotoSansKR-Bold.otf");
console.log("exists", fs.existsSync(p), fs.existsSync(b));

Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: p, fontWeight: 400 },
    { src: b, fontWeight: 700 },
  ],
});
console.log("families", Font.getRegisteredFontFamilies());

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansKR", fontSize: 12, padding: 40 },
});
const doc = React.createElement(
  Document,
  null,
  React.createElement(
    Page,
    { size: "A4", style: styles.page },
    React.createElement(Text, null, "한글 테스트 AX Fit"),
  ),
);

try {
  const buf = await pdf(doc).toBuffer();
  fs.mkdirSync("scripts/pdf-samples", { recursive: true });
  fs.writeFileSync("scripts/pdf-samples/font-test.pdf", buf);
  console.log("ok bytes", buf.length);
} catch (e) {
  console.error("pdf failed", e);
}
