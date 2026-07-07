import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { CheckinPopup } from "@/components/checkins/CheckinPopup";
import { getPendingPopup } from "@/lib/checkins/get-pending-popup";
import { getProfile } from "@/lib/auth/get-profile";
import { ensureDueCheckins } from "@/lib/habits/ensure-due-checkins";
import { isOnboardingComplete } from "@/lib/profile/onboarding-context";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureDueCheckins();
  const [profile, popup] = await Promise.all([getProfile(), getPendingPopup()]);

  if (!isOnboardingComplete(profile)) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6 md:px-10 md:py-8 lg:px-14">
        {children}
      </main>
      <CheckinPopup popup={popup} />
    </div>
  );
}
