"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectionCard } from "@/components/ui/SelectionCard";
import {
  coachOptions,
  experienceOptions,
  mainGoalOptions,
  ONBOARDING_ANSWERS_KEY,
  priorityOptions,
  USER_NAME_KEY,
} from "@/lib/constants/onboarding";
import type {
  AiCoachStyle,
  JournalExperience,
  OnboardingAnswers,
  OnboardingMainGoal,
  OnboardingPriority,
} from "@/lib/types/onboarding";

const emptyAnswers: OnboardingAnswers = {
  mainGoal: null,
  priorities: [],
  experience: null,
  coachStyle: null,
};

interface OnboardingWizardProps {
  userName?: string;
  compact?: boolean;
}

export function OnboardingWizard({
  userName: userNameProp,
  compact = false,
}: Readonly<OnboardingWizardProps>) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState(userNameProp ?? "daar");
  const [answers, setAnswers] = useState<OnboardingAnswers>(emptyAnswers);

  useEffect(() => {
    if (userNameProp) {
      setUserName(userNameProp);
      return;
    }

    const storedName = sessionStorage.getItem(USER_NAME_KEY);
    if (storedName) {
      setUserName(storedName);
    }
  }, [userNameProp]);

  function handleMainGoalSelect(goal: OnboardingMainGoal) {
    setAnswers((current) => ({ ...current, mainGoal: goal }));
    setStep(2);
  }

  function handlePriorityToggle(priority: OnboardingPriority) {
    setAnswers((current) => {
      const isSelected = current.priorities.includes(priority);
      return {
        ...current,
        priorities: isSelected
          ? current.priorities.filter((item) => item !== priority)
          : [...current.priorities, priority],
      };
    });
  }

  function handleExperienceSelect(experience: JournalExperience) {
    setAnswers((current) => ({ ...current, experience }));
    setStep(4);
  }

  function handleCoachSelect(coachStyle: AiCoachStyle) {
    const finalAnswers: OnboardingAnswers = { ...answers, coachStyle };
    sessionStorage.setItem(ONBOARDING_ANSWERS_KEY, JSON.stringify(finalAnswers));
    router.push("/schrijf?prompt=first_entry");
  }

  const optionListClass = "flex flex-col gap-3";
  const wrapperClass = compact ? "w-full" : "mx-auto w-full max-w-3xl px-6 py-10";

  return (
    <div className={wrapperClass}>
      {step > 1 ? (
        <button
          className={`text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-900 ${compact ? "mb-4" : "mb-8"}`}
          onClick={() => setStep((current) => current - 1)}
          type="button"
        >
          ← Terug
        </button>
      ) : (
        <div className={compact ? "mb-4 h-5" : "mb-8 h-5"} />
      )}

      <p className="text-center text-sm text-muted">Stap {step} van 4</p>

      {step === 1 ? (
        <StepContent
          compact={compact}
          subtitle="Kies je hoofddoel (je kunt dit later altijd aanpassen)."
          title={`Wat brengt je bij Lumina, ${userName}?`}
        >
          <div className={optionListClass}>
            {mainGoalOptions.map((option) => (
              <SelectionCard
                isSelected={answers.mainGoal === option.id}
                key={option.id}
                label={option.label}
                onClick={() => handleMainGoalSelect(option.id)}
              />
            ))}
          </div>
        </StepContent>
      ) : null}

      {step === 2 ? (
        <StepContent
          compact={compact}
          subtitle="Je kunt meerdere opties kiezen."
          title="Wat is er op dit moment belangrijk voor je?"
        >
          <div className={optionListClass}>
            {priorityOptions.map((option) => (
              <SelectionCard
                isSelected={answers.priorities.includes(option.id)}
                key={option.id}
                label={option.label}
                onClick={() => handlePriorityToggle(option.id)}
              />
            ))}
          </div>
          <Button
            className={`w-full ${compact ? "mt-6" : "mt-8 sm:w-auto"}`}
            disabled={answers.priorities.length === 0}
            onClick={() => setStep(3)}
            type="button"
            variant="primary"
          >
            Volgende
          </Button>
        </StepContent>
      ) : null}

      {step === 3 ? (
        <StepContent compact={compact} title="Hoeveel journal ervaring heb je?">
          <div className={optionListClass}>
            {experienceOptions.map((option) => (
              <SelectionCard
                isSelected={answers.experience === option.id}
                key={option.id}
                label={option.label}
                onClick={() => handleExperienceSelect(option.id)}
              />
            ))}
          </div>
        </StepContent>
      ) : null}

      {step === 4 ? (
        <StepContent compact={compact} title="Kies je AI-coach">
          <div className={optionListClass}>
            {coachOptions.map((option) => (
              <SelectionCard
                description={option.description}
                isSelected={answers.coachStyle === option.id}
                key={option.id}
                label={option.label}
                onClick={() => handleCoachSelect(option.id)}
              />
            ))}
          </div>
          <p className={`text-center text-sm text-muted ${compact ? "mt-4" : "mt-6"}`}>
            Je kunt je coach later aanpassen in Instellingen.
          </p>
        </StepContent>
      ) : null}
    </div>
  );
}

interface StepContentProps {
  title: string;
  subtitle?: string;
  compact?: boolean;
  children: React.ReactNode;
}

function StepContent({
  title,
  subtitle,
  compact = false,
  children,
}: Readonly<StepContentProps>) {
  return (
    <div className="mt-4">
      <h1
        className={`text-center font-serif leading-tight text-foreground ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-prose text-center leading-relaxed text-muted">
          {subtitle}
        </p>
      ) : null}
      <div className={compact ? "mt-6" : "mt-10"}>{children}</div>
    </div>
  );
}
