import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { getProfile } from "@/lib/auth/get-profile";
import { isOnboardingComplete } from "@/lib/profile/onboarding-context";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();

  if (!isOnboardingComplete(profile)) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 md:px-10">
        {children}
      </main>
    </div>
  );
}
