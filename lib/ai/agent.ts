import { generateText, stepCountIs, APICallError } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  buildSystemPrompt,
  buildUserMessage,
  type InteractionMode,
} from "@/lib/ai/agent-prompt";
import { mapOpenAiError } from "@/lib/ai/openai-errors";
import type { ToolbarAiAction } from "@/lib/ai/question-context";
import { createLuminaTools } from "@/lib/ai/tools";
import type { AiCoachStyle } from "@/lib/types/onboarding";

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

export async function runLuminaAgent(
  input: AgentInput,
): Promise<AgentResult | { error: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        error:
          "Lumina is tijdelijk niet beschikbaar. Je kunt wel gewoon doorgaan met schrijven.",
      };
    }

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

    let insightId: string | undefined;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userMessage,
      tools: createLuminaTools({
        userId: input.userId,
        defaultEntryId: input.entryId,
      }),
      stopWhen: stepCountIs(5),
      onStepFinish({ toolResults }) {
        for (const toolResult of toolResults) {
          if (toolResult.toolName !== "save_ai_insight") {
            continue;
          }

          insightId =
            extractInsightId(toolResult.output) ?? insightId;
        }
      },
    });

    const answer = result.text.trim();

    if (!answer) {
      return { error: "AI gaf geen antwoord." };
    }

    return { answer, insightId };
  } catch (error) {
    if (APICallError.isInstance(error) && error.statusCode === 429) {
      return {
        error:
          "Lumina is tijdelijk niet beschikbaar door drukte. Probeer het zo opnieuw.",
      };
    }

    return { error: mapOpenAiError(error, "agent") };
  }
}
