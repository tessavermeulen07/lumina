export const ENTRY_IMAGES_BUCKET = "entry-images";

export const MAX_ENTRY_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_ENTRY_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const STORAGE_PATH_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/.+$/i;

export function buildEntryImagePath(
  userId: string,
  entryId: string,
  filename: string,
): string {
  return `${userId}/${entryId}/${filename}`;
}

export function getEntryImageServeUrl(storagePath: string): string {
  return `/api/entry-images/${storagePath}`;
}

export function isValidEntryImagePath(path: string): boolean {
  return STORAGE_PATH_PATTERN.test(path);
}

export function getExtensionForMimeType(mimeType: string): string | null {
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
    case "image/pjpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return null;
  }
}

export function normalizeEntryImageHtml(html: string): string {
  if (!html.trim() || !/<img\b/i.test(html)) {
    return html;
  }

  if (typeof document === "undefined") {
    return normalizeEntryImageHtmlServer(html);
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  for (const image of template.content.querySelectorAll("img")) {
    const storagePath = image.getAttribute("data-storage-path");

    if (storagePath) {
      image.setAttribute("src", getEntryImageServeUrl(storagePath));
    }
  }

  return template.innerHTML;
}

function normalizeEntryImageHtmlServer(html: string): string {
  return html.replace(
    /<img\b([^>]*?)data-storage-path="([^"]+)"([^>]*?)>/gi,
    (match, before, storagePath, after) => {
      const serveUrl = getEntryImageServeUrl(storagePath);
      const withoutSrc = `${before}${after}`.replace(/\ssrc="[^"]*"/i, "");
      return `<img${withoutSrc} data-storage-path="${storagePath}" src="${serveUrl}">`;
    },
  );
}

export function resolveEntryImageHtml(html: string): string {
  return normalizeEntryImageHtml(html);
}
