import type { ToolbarAiAction } from "@/lib/ai/question-context";

export type LuminaStreamMode = "dashboard" | "entry_toolbar";

export interface LuminaStreamDashboardBody {
  mode: "dashboard";
  question: string;
}

export interface LuminaStreamEntryBody {
  mode: "entry_toolbar";
  actionLabel: string;
  entryId?: string;
  activeUserBlockId?: string;
  activeUserContent: string;
}

export type LuminaStreamRequestBody =
  | LuminaStreamDashboardBody
  | LuminaStreamEntryBody;

export interface LuminaStreamEntryMeta {
  entryId: string;
  activeBlockId: string;
  action: ToolbarAiAction;
}

export interface LuminaStreamResult {
  text: string;
  entryMeta?: LuminaStreamEntryMeta;
}
