import { Logo } from "@/components/ui/Logo";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketing-aura flex min-h-screen flex-col">
      <div className="flex justify-center pt-10 opacity-70">
        <Logo className="h-6 w-6" />
      </div>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}
