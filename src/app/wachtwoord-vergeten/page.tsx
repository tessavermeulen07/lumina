import { Suspense } from "react";
import { ForgotPasswordCard } from "@/components/features/auth/ForgotPasswordCard";

export default function WachtwoordVergetenPage() {
  return (
    <main className="marketing-aura flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense>
          <ForgotPasswordCard />
        </Suspense>
      </div>
    </main>
  );
}
