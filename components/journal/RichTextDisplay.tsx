"use client";

import { RichTextImageContainer } from "@/components/journal/RichTextImageContainer";
import { normalizeEntryImageHtml } from "@/lib/utils/entry-images";
import { sanitizeRichTextHtml } from "@/lib/utils/sanitize-rich-text-html";
import { richTextProseClass } from "@/lib/journal/rich-text-styles";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({
  content,
  className = "",
}: Readonly<RichTextDisplayProps>) {
  const sanitized = sanitizeRichTextHtml(normalizeEntryImageHtml(content));

  if (!sanitized) {
    return null;
  }

  return (
    <RichTextImageContainer className={`${richTextProseClass} ${className}`.trim()}>
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </RichTextImageContainer>
  );
}
