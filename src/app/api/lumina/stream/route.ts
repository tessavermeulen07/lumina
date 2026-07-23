import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { resolveCoachStyle } from "@/lib/ai/agent-prompt";
import { streamLuminaAgent } from "@/lib/ai/agent";
import { prepareEntryAiContext } from "@/lib/ai/prepare-entry-ai-context";
import type { LuminaStreamRequestBody } from "@/lib/ai/lumina-stream-types";
import { getProfileForApi } from "@/lib/auth/get-profile-for-api";
import { buildOnboardingPromptContext } from "@/lib/profile/onboarding-context";

export const maxDuration = 60;

function isValidBody(body: unknown): body is LuminaStreamRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const mode = (body as LuminaStreamRequestBody).mode;

  if (mode === "dashboard") {
    return (
      typeof (body as { question?: unknown }).question === "string" &&
      (body as { question: string }).question.trim().length > 0
    );
  }

  if (mode === "entry_toolbar") {
    const entryBody = body as {
      actionLabel?: unknown;
      activeUserContent?: unknown;
    };

    return (
      typeof entryBody.actionLabel === "string" &&
      typeof entryBody.activeUserContent === "string"
    );
  }

  return false;
}

export async function POST(request: Request) {
  const profile = await getProfileForApi();

  if (!profile) {
    return NextResponse.json(
      { error: "Je moet ingelogd zijn om Lumina te gebruiken." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ongeldig verzoek." },
      { status: 400 },
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Ongeldig verzoek." },
      { status: 400 },
    );
  }

  if (body.mode === "dashboard") {
    const question = body.question.trim();
    const stream = streamLuminaAgent({
      userQuestion: question,
      userId: profile.id,
      interactionMode: "dashboard",
      coachStyle: resolveCoachStyle(profile.ai_persona_preference),
      onboardingContext: buildOnboardingPromptContext(profile),
    });

    if ("error" in stream) {
      return NextResponse.json({ error: stream.error }, { status: 503 });
    }

    void stream.result.text.then((text) => {
      if (text.trim()) {
        revalidatePath("/vandaag");
      }
    });

    return stream.result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const prepared = await prepareEntryAiContext({
    actionLabel: body.actionLabel,
    entryId: body.entryId,
    activeUserBlockId: body.activeUserBlockId,
    activeUserContent: body.activeUserContent,
    profile,
  });

  if ("error" in prepared) {
    return NextResponse.json({ error: prepared.error }, { status: 400 });
  }

  const stream = streamLuminaAgent(prepared.agentInput);

  if ("error" in stream) {
    return NextResponse.json({ error: stream.error }, { status: 503 });
  }

  return stream.result.toTextStreamResponse({
    headers: {
      "Cache-Control": "no-store",
      "X-Lumina-Entry-Id": prepared.entryId,
      "X-Lumina-Active-Block-Id": prepared.activeBlockId,
      "X-Lumina-Action": prepared.action,
    },
  });
}
