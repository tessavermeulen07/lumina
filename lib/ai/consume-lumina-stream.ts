import type {
  LuminaStreamEntryMeta,
  LuminaStreamRequestBody,
  LuminaStreamResult,
} from "@/lib/ai/lumina-stream-types";
import type { ToolbarAiAction } from "@/lib/ai/question-context";

export class LuminaStreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LuminaStreamError";
  }
}

function readEntryMeta(response: Response): LuminaStreamEntryMeta | undefined {
  const entryId = response.headers.get("X-Lumina-Entry-Id");
  const activeBlockId = response.headers.get("X-Lumina-Active-Block-Id");
  const action = response.headers.get("X-Lumina-Action");

  if (!entryId || !activeBlockId || !action) {
    return undefined;
  }

  return {
    entryId,
    activeBlockId,
    action: action as ToolbarAiAction,
  };
}

export async function consumeLuminaStream(
  body: LuminaStreamRequestBody,
  options?: {
    signal?: AbortSignal;
    onReady?: (meta: { entryMeta?: LuminaStreamEntryMeta }) => void;
    onChunk?: (text: string) => void;
  },
): Promise<LuminaStreamResult> {
  const response = await fetch("/api/lumina/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  if (!response.ok) {
    let message = "Er ging iets mis bij het ophalen van een antwoord.";

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Keep default message when response is not JSON.
    }

    throw new LuminaStreamError(message);
  }

  if (!response.body) {
    throw new LuminaStreamError("Geen stream ontvangen.");
  }

  const entryMeta = readEntryMeta(response);
  options?.onReady?.({ entryMeta });
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    text += decoder.decode(value, { stream: true });
    options?.onChunk?.(text);
  }

  text += decoder.decode();

  const trimmed = text.trim();

  if (!trimmed) {
    throw new LuminaStreamError("AI gaf geen antwoord.");
  }

  return {
    text: trimmed,
    entryMeta,
  };
}
