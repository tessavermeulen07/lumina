import { NextResponse } from "next/server";
import { scheduleDueCheckinsForToday } from "@/lib/habits/schedule-due-checkins";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const headerSecret = request.headers.get("x-cron-secret");

  return bearerToken === cronSecret || headerSecret === cronSecret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Niet geautoriseerd." },
      { status: 401 },
    );
  }

  try {
    const stats = await scheduleDueCheckinsForToday();

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error("Cron check-ins mislukt", error);
    return NextResponse.json(
      { error: "Check-ins plannen is mislukt." },
      { status: 500 },
    );
  }
}
