"use client";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { ExecutiveReport } from "@/types/report";
import { APP_NAME } from "@/lib/constants";

const FONT_FAMILY = "NotoSansKR";

let fontsRegistered = false;

/**
 * Register Korean-capable fonts once.
 * Pass absolute file paths (Node) or absolute http(s) URLs (browser).
 */
export function registerPdfFonts(regularSrc: string, boldSrc: string) {
  if (fontsRegistered) return;

  Font.register({
    family: FONT_FAMILY,
    fonts: [
      { src: regularSrc, fontWeight: 400 },
      { src: boldSrc, fontWeight: 700 },
    ],
  });

  // Avoid Latin hyphenation breaking Korean runs
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

function registerBrowserFonts() {
  if (typeof window === "undefined") {
    throw new Error("Browser font registration requires window");
  }
  const origin = window.location.origin;
  registerPdfFonts(
    `${origin}/fonts/NotoSansKR-Regular.otf`,
    `${origin}/fonts/NotoSansKR-Bold.otf`,
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontSize: 9.5,
    fontFamily: FONT_FAMILY,
    lineHeight: 1.4,
    color: "#1a1a1a",
  },
  headerBar: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#111",
    paddingBottom: 8,
    marginBottom: 10,
  },
  brand: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#555",
    marginBottom: 2,
    fontWeight: 700,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 8.5,
    color: "#666",
  },
  section: {
    marginBottom: 8,
  },
  h2: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
    color: "#111",
    borderLeftWidth: 2.5,
    borderLeftColor: "#222",
    paddingLeft: 5,
  },
  body: {
    fontSize: 9.5,
    lineHeight: 1.45,
    color: "#222",
  },
  callout: {
    backgroundColor: "#f5f5f5",
    padding: 7,
    borderRadius: 2,
    marginTop: 1,
  },
  problemItem: {
    flexDirection: "row",
    marginBottom: 2,
    paddingRight: 4,
  },
  bullet: {
    width: 10,
    fontSize: 9.5,
    color: "#333",
  },
  problemText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: "#222",
  },
  roleRow: {
    flexDirection: "row",
    marginBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 2,
  },
  roleLabel: {
    width: 48,
    fontSize: 8.5,
    fontWeight: 700,
    color: "#333",
  },
  roleBody: {
    flex: 1,
    fontSize: 8.5,
    color: "#333",
    lineHeight: 1.35,
  },
  actionBlock: {
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  actionTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 1,
  },
  actionMeta: {
    fontSize: 8,
    color: "#444",
    lineHeight: 1.35,
  },
  actionMetrics: {
    fontSize: 7.5,
    color: "#666",
    marginTop: 1,
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    fontSize: 7.5,
    color: "#888",
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export function ExecutiveReportDocument({
  report,
  companyLabel,
}: {
  report: ExecutiveReport;
  companyLabel?: string;
}) {
  const actions = report.next30Days.slice(0, 3);

  return (
    <Document
      title={`${APP_NAME} 경영진 한 장 리포트`}
      author={APP_NAME}
      subject="AX 조직 마찰 진단 · 업무 재설계 요약"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brand}>{APP_NAME}</Text>
          <Text style={styles.title}>경영진용 한 장 리포트</Text>
          <Text style={styles.subtitle}>
            {companyLabel ?? "조직 진단 결과"} · 구조적 장벽 · 「업무 재설계」 관점
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>1. 현재 상태 (한 줄 진단)</Text>
          <View style={styles.callout}>
            <Text style={styles.body}>{report.headline}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>2. 핵심 구조적 문제</Text>
          {report.structuralProblems.slice(0, 3).map((p) => (
            <View key={p} style={styles.problemItem} wrap={false}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.problemText}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>3. 권고 방향</Text>
          <Text style={styles.body}>{report.recommendation}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>4. 역할 분담</Text>
          {(
            [
              ["경영진", report.roleSplit.executive],
              ["HR", report.roleSplit.hr],
              ["IT", report.roleSplit.it],
              ["현업", report.roleSplit.business],
            ] as const
          ).map(([label, body]) => (
            <View key={label} style={styles.roleRow} wrap={false}>
              <Text style={styles.roleLabel}>{label}</Text>
              <Text style={styles.roleBody}>{body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>5. 다음 30일 액션</Text>
          {actions.map((a, i) => (
            <View key={a.id} style={styles.actionBlock} wrap={false}>
              <Text style={styles.actionTitle}>
                {i + 1}. {a.title}
              </Text>
              <Text style={styles.actionMeta}>
                누가: {a.who} · 무엇을: {a.what}
              </Text>
              <Text style={styles.actionMeta}>
                기한: {a.byWhen} · 산출물: {a.deliverable}
              </Text>
              <Text style={styles.actionMetrics}>
                확인(Did): {a.metrics.did} · 결과(Result): {a.metrics.result}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {APP_NAME} · 교육 추가가 아닌 구조 재설계를 위한 근거 자료
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export async function downloadExecutivePdf(
  report: ExecutiveReport,
  filename = "ax-fit-executive-report.pdf",
  companyLabel?: string,
) {
  registerBrowserFonts();
  const blob = await pdf(
    <ExecutiveReportDocument report={report} companyLabel={companyLabel} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
