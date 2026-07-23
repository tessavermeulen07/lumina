"use client";

import { useCallback, useRef, useState } from "react";
import {
  consumeLuminaStream,
  LuminaStreamError,
} from "@/lib/ai/consume-lumina-stream";
import type {
  LuminaStreamEntryMeta,
  LuminaStreamRequestBody,
  LuminaStreamResult,
} from "@/lib/ai/lumina-stream-types";

type StreamCallbacks = {
  onReady?: (meta: { entryMeta?: LuminaStreamEntryMeta }) => void;
  onChunk?: (text: string) => void;
};

type StreamOutcome =
  | { ok: true; result: LuminaStreamResult }
  | { ok: false; error: string | null; cancelled: boolean };

export function useLuminaStream() {
  const abortRef = useRef<AbortController | null>(null);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const streamLumina = useCallback(async (
    body: LuminaStreamRequestBody,
    callbacks?: StreamCallbacks,
  ): Promise<StreamOutcome> => {
    cancelStream();

    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    setError(null);
    setStreamingText("");

    try {
      const result = await consumeLuminaStream(body, {
        signal: controller.signal,
        onReady: callbacks?.onReady,
        onChunk: (text) => {
          setStreamingText(text);
          callbacks?.onChunk?.(text);
        },
      });

      setStreamingText(result.text);
      return { ok: true, result };
    } catch (streamError) {
      if (streamError instanceof DOMException && streamError.name === "AbortError") {
        setStreamingText(null);
        return { ok: false, error: null, cancelled: true };
      }

      const message =
        streamError instanceof LuminaStreamError
          ? streamError.message
          : "Er ging iets mis bij het ophalen van een antwoord.";

      setError(message);
      setStreamingText(null);
      return { ok: false, error: message, cancelled: false };
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsStreaming(false);
    }
  }, [cancelStream]);

  const resetStream = useCallback(() => {
    cancelStream();
    setStreamingText(null);
    setError(null);
    setIsStreaming(false);
  }, [cancelStream]);

  return {
    streamLumina,
    cancelStream,
    resetStream,
    streamingText,
    isStreaming,
    error,
  };
}
