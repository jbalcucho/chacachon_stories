import "server-only";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { StoryBlock } from "@/lib/story-markdown";
import type { PersonalizedStoryContent } from "@/lib/story-reader";

/**
 * Exportación a PDF (Fase C1.1, docs/plan-mejoras-competitivas.md). Usa
 * @react-pdf/renderer (JS puro, sin binario de Chromium) en vez de
 * puppeteer/playwright -- evita el riesgo de tamaño/cold-start de empaquetar
 * Chromium en una función serverless de Vercel. Reutiliza la fuente
 * incorporada Times-Roman (serif, buena para lectura en voz alta) en vez de
 * intentar cargar Literata en runtime: cero llamadas de red durante la
 * generación, cero binarios de fuente que mantener en el repo.
 */

const styles = StyleSheet.create({
  cover: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: 56,
    backgroundColor: "#243a5e",
  },
  coverBrand: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ffca5c",
    letterSpacing: 2,
    marginBottom: 28,
    textTransform: "uppercase",
  },
  coverTitle: {
    fontSize: 30,
    fontFamily: "Times-Bold",
    color: "#fff8f2",
    textAlign: "center",
    lineHeight: 1.3,
  },
  coverFor: {
    marginTop: 22,
    fontSize: 14,
    fontFamily: "Times-Italic",
    color: "#f0e6d8",
  },
  coverFooter: {
    position: "absolute",
    bottom: 40,
    fontSize: 9,
    color: "#b9c4dd",
  },
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 60,
    fontFamily: "Times-Roman",
    fontSize: 13,
    lineHeight: 1.6,
    color: "#241f1a",
  },
  heading: {
    fontFamily: "Times-Bold",
    fontSize: 15,
    marginTop: 18,
    marginBottom: 8,
    color: "#5a3c1e",
  },
  paragraph: {
    marginBottom: 10,
  },
  listItem: {
    marginBottom: 4,
    marginLeft: 14,
  },
  divider: {
    marginVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#d8cdb8",
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#9a8f7c",
  },
});

/** Quita los marcadores `**negrita**`/`*cursiva*`/`_cursiva_` -- el PDF no
 * necesita el énfasis inline, solo texto limpio y legible. */
function stripInlineMarkers(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g, "$1$2$3");
}

function renderBlock(block: StoryBlock, index: number) {
  switch (block.type) {
    case "heading":
      return (
        <Text key={index} style={styles.heading}>
          {stripInlineMarkers(block.text)}
        </Text>
      );
    case "paragraph":
      return (
        <Text key={index} style={styles.paragraph}>
          {stripInlineMarkers(block.text)}
        </Text>
      );
    case "list":
      return (
        <View key={index}>
          {block.items.map((item, itemIndex) => (
            <Text key={itemIndex} style={styles.listItem}>
              {block.ordered ? `${itemIndex + 1}. ` : "• "}
              {stripInlineMarkers(item)}
            </Text>
          ))}
        </View>
      );
    case "divider":
      return <View key={index} style={styles.divider} />;
    default:
      return null;
  }
}

export async function buildStoryPdf(
  content: PersonalizedStoryContent,
  options: { childName?: string | null } = {},
): Promise<Buffer> {
  const doc = (
    <Document title={content.title} producer="Chacachón">
      <Page size="A5" style={styles.cover}>
        <Text style={styles.coverBrand}>Chacachón</Text>
        <Text style={styles.coverTitle}>{content.title}</Text>
        {options.childName ? (
          <Text style={styles.coverFor}>Para {options.childName}</Text>
        ) : null}
        <Text style={styles.coverFooter}>
          Cuentos de fantasía inspirados en tu hogar
        </Text>
      </Page>
      <Page size="A5" style={styles.page} wrap>
        {content.blocks.map(renderBlock)}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            pageNumber > 1 ? `${pageNumber - 1} / ${totalPages - 1}` : ""
          }
          fixed
        />
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

/** Nombre de archivo seguro: sin tildes/símbolos que rompan Content-Disposition. */
export function pdfFileNameFromTitle(title: string): string {
  const withoutAccents = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const slug = withoutAccents
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${slug || "cuento"}-chacachon.pdf`;
}
