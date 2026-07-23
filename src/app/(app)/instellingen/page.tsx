import { ProfileForm } from "@/components/features/settings/ProfileForm";
import { getProfile } from "@/lib/auth/get-profile";

export default async function InstellingenPage() {
  const profile = await getProfile();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-foreground">Instellingen</h1>
      <p className="max-w-prose leading-relaxed text-muted">
        Beheer je profiel en account.
      </p>
      <ProfileForm
        aiPersonaPreference={profile.ai_persona_preference}
        email={profile.email}
        eveningReflectionTime={profile.evening_reflection_time}
        goalsCheckinTime={profile.goals_checkin_time}
        morningReflectionTime={profile.morning_reflection_time}
        timezone={profile.timezone}
        username={profile.username}
      />
    </div>
  );
}
