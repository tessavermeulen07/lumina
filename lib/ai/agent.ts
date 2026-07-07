import OpenAI from "openai";
import {
  buildSystemPrompt,
  buildUserMessage,
  type InteractionMode,
} from "@/lib/ai/agent-prompt";
import type { ToolbarAiAction } from "@/lib/ai/question-context";
import {
  executeLuminaTool,
  luminaToolDefinitions,
} from "@/lib/ai/tools";
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

function mapAgentError(error: unknown): string {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      return "Lumina is tijdelijk niet beschikbaar door drukte. Probeer het zo opnieuw.";
    }

    if (typeof error.status === "number" && error.status >= 500) {
      return "Lumina is tijdelijk niet beschikbaar. Je kunt wel gewoon doorgaan met schrijven.";
    }
  }

  return "Lumina is tijdelijk niet beschikbaar. Je kunt wel gewoon doorgaan met schrijven.";
}

function extractInsightId(toolResult: string): string | undefined {
  try {
    const parsed = JSON.parse(toolResult) as { id?: string };
    return parsed.id;
  } catch {
    return undefined;
  }
}

export async function runLuminaAgent(
  input: AgentInput,
): Promise<AgentResult | { error: string }> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        error: "Lumina is tijdelijk niet beschikbaar. Je kunt wel gewoon doorgaan met schrijven.",
      };
    }

    const openai = new OpenAI({ apiKey });
    const systemPrompt = buildSystemPrompt({
      interactionMode: input.interactionMode,
      coachStyle: input.coachStyle,
      onboardingContext: input.onboardingContext,
      toolbarAction: input.toolbarAction,
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: buildUserMessage({
          userQuestion: input.userQuestion,
          interactionMode: input.interactionMode,
          actionLabel: input.actionLabel,
          toolbarAction: input.toolbarAction,
          entryContent: input.entryContent,
          entryThreadContext: input.entryThreadContext,
        }),
      },
    ];

    let insightId: string | undefined;
    const maxRounds = 5;

    for (let round = 0; round < maxRounds; round += 1) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools: luminaToolDefinitions,
        tool_choice: "auto",
      });

      const choice = completion.choices[0]?.message;

      if (!choice) {
        return { error: "AI gaf geen antwoord." };
      }

      if (choice.tool_calls?.length) {
        messages.push(choice);

        for (const toolCall of choice.tool_calls) {
          if (toolCall.type !== "function") continue;

          const args = JSON.parse(toolCall.function.arguments) as Record<
            string,
            unknown
          >;

          const result = await executeLuminaTool(
            toolCall.function.name,
            args,
            { userId: input.userId, defaultEntryId: input.entryId },
          );

          if (toolCall.function.name === "save_ai_insight") {
            insightId = extractInsightId(result) ?? insightId;
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }

        continue;
      }

      const answer = choice.content?.trim();

      if (!answer) {
        return { error: "AI gaf geen antwoord." };
      }

      return { answer, insightId };
    }

    return { error: "AI kon de vraag niet volledig verwerken." };
  } catch (error) {
    return { error: mapAgentError(error) };
  }
}
