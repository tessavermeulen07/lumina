"use client";

import DOMPurify from "dompurify";
import { resolveEntryImageHtml } from "@/lib/utils/entry-images";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "hr",
    "span",
    "img",
  ],
  ALLOWED_ATTR: ["class", "src", "alt", "data-storage-path"],
};

export function sanitizeRichTextHtml(html: string): string {
  if (!html.trim()) {
    return "";
  }

  return DOMPurify.sanitize(resolveEntryImageHtml(html), SANITIZE_CONFIG);
}
