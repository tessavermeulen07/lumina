import { APICallError, generateText, stepCountIs, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  buildSystemPrompt,
  buildUserMessage,
  type InteractionMode,
} from "@/lib/ai/agent-prompt";
import { mapOpenAiError } from "@/lib/ai/openai-errors";
import type { ToolbarAiAction } from "@/lib/ai/question-context";
import { createLuminaTools } from "@/lib/ai/tools";
import type { AiCoachStyle } from "@/types/onboarding";

export interface AgentInput {
  userQuestion: string;
  entryContent?: string;
  entryThreadContext?: string;
  entryId?: string;
  userId: string;
  interactionMode: InteractionMode;
  coachStyle: AiCoachStyle;
  onboardingContext?: string;
  actionLabel?: string;
  toolbarAction?: ToolbarAiAction;
}

export interface AgentResult {
  answer: string;
  insightId?: string;
}

function extractInsightId(output: unknown): string | undefined {
  if (!output || typeof output !== "object") {
    return undefined;
  }

  if ("id" in output && typeof output.id === "string") {
    return output.id;
  }

  return undefined;
}

function buildAgentCall(input: AgentInput) {
  const systemPrompt = buildSystemPrompt({
    interactionMode: input.interactionMode,
    coachStyle: input.coachStyle,
    onboardingContext: input.onboardingContext,
    toolbarAction: input.toolbarAction,
  });

  const userMessage = buildUserMessage({
    userQuestion: input.userQuestion,
    interactionMode: input.interactionMode,
    actionLabel: input.actionLabel,
    toolbarAction: input.toolbarAction,
    entryContent: input.entryContent,
    entryThreadContext: input.entryThreadContext,
  });

  const tools = createLuminaTools({
    userId: input.userId,
    defaultEntryId: input.entryId,
  });

  return { systemPrompt, userMessage, tools };
}

function createInsightTracker() {
  let insightId: string | undefined;

  return {
    onStepFinish({ toolResults }: { toolResults: Array<{ toolName: string; output: unknown }> }) {
      for (const toolResult of toolResults) {
        if (toolResult.toolName !== "save_ai_insight") {
          continue;
        }

        insightId = extractInsightId(toolResult.output) ?? insightId;
      }
    },
    getInsightId: () => insightId,
  };
}

export function getLuminaUnavailableMessage() {
  return "Lumina is tijdelijk niet beschikbaar. Je kunt wel gewoon doorgaan met schrijven.";
}

export function getLuminaRateLimitMessage() {
  return "Lumina is tijdelijk niet beschikbaar door drukte. Probeer het zo opnieuw.";
}

export async function runLuminaAgent(
  input: AgentInput,
): Promise<AgentResult | { error: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { error: getLuminaUnavailableMessage() };
    }

    const { systemPrompt, userMessage, tools } = buildAgentCall(input);
    const insightTracker = createInsightTracker();

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userMessage,
      tools,
      stopWhen: stepCountIs(5),
      onStepFinish: insightTracker.onStepFinish,
    });

    const answer = result.text.trim();

    if (!answer) {
      return { error: "AI gaf geen antwoord." };
    }

    return { answer, insightId: insightTracker.getInsightId() };
  } catch (error) {
    if (APICallError.isInstance(error) && error.statusCode === 429) {
      return { error: getLuminaRateLimitMessage() };
    }

    return { error: mapOpenAiError(error, "agent") };
  }
}

export function streamLuminaAgent(input: AgentInput) {
  if (!process.env.OPENAI_API_KEY) {
    return { error: getLuminaUnavailableMessage() } as const;
  }

  const { systemPrompt, userMessage, tools } = buildAgentCall(input);
  const insightTracker = createInsightTracker();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    prompt: userMessage,
    tools,
    stopWhen: stepCountIs(5),
    onStepFinish: insightTracker.onStepFinish,
  });

  return { result, getInsightId: insightTracker.getInsightId };
}

export function mapStreamError(error: unknown): string {
  if (APICallError.isInstance(error) && error.statusCode === 429) {
    return getLuminaRateLimitMessage();
  }

  return mapOpenAiError(error, "agent");
}
