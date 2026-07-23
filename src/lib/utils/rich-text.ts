import { resolveEntryImageHtml } from "@/lib/utils/entry-images";

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export function looksLikeHtml(content: string): boolean {
  return HTML_TAG_PATTERN.test(content.trim());
}

export function normalizeEditorContent(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  if (looksLikeHtml(trimmed)) {
    return resolveEntryImageHtml(trimmed);
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

export function stripRichTextToPlain(html: string): string {
  const trimmed = html.trim();

  if (!trimmed) {
    return "";
  }

  const withImagePlaceholders = trimmed.replace(
    /<img\b[^>]*>/gi,
    "[afbeelding]",
  );

  if (!looksLikeHtml(withImagePlaceholders)) {
    return withImagePlaceholders;
  }

  const withBreaks = withImagePlaceholders
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<\/p>/gi, "\n\n")
    .replaceAll(/<\/h[1-6]>/gi, "\n\n")
    .replaceAll(/<\/li>/gi, "\n")
    .replaceAll(/<hr\s*\/?>/gi, "\n---\n");

  const text = decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, ""));

  return text.replaceAll(/\n{3,}/g, "\n\n").trim();
}

export function isRichTextEmpty(html: string): boolean {
  const trimmed = html.trim();

  if (!trimmed) {
    return true;
  }

  if (/<img\b/i.test(trimmed)) {
    return false;
  }

  return stripRichTextToPlain(trimmed).length === 0;
}
