interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({
  icon,
  title,
  description,
}: Readonly<FeatureCardProps>) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-lumina-500/25 bg-surface p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lumina-500/10 text-lumina-500">
        {icon}
      </div>
      <h3 className="font-serif text-xl text-foreground">{title}</h3>
      <p className="leading-relaxed text-muted">{description}</p>
    </article>
  );
}

function CoachIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function JournalIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M2.25 18L9 11.25l4.306 4.307a1.125 1.125 0 001.746-.066l6.105-8.25" />
      <path d="M16.5 6.75h3.75v3.75" />
    </svg>
  );
}

const features = [
  {
    icon: <JournalIcon />,
    title: "Dagelijkse reflectie",
    description: "Schrijf op wat je bezighoudt, op jouw tempo.",
  },
  {
    icon: <ChartIcon />,
    title: "Inzicht in patronen",
    description: "Herlees je reflecties, ontdek wat er terugkomt en verbeter jezelf.",
  },
  {
    icon: <GrowthIcon />,
    title: "Intenties & groei",
    description: "Stel doelen en herinneringen aan jezelf en volg zo je persoonlijke ontwikkeling.",
  },
  {
    icon: <CoachIcon />,
    title: "AI-coach",
    description:
      "Ontvang direct feedback, vragen en alternatieve perspectieven op je reflecties.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16" id="functies">
      <h2 className="mb-4 text-center font-serif text-3xl text-foreground">
        Wat Lumina voor je doet
      </h2>
      <p className="mx-auto mb-12 max-w-2xl text-center leading-relaxed text-muted">
        Eenvoudige tools om te schrijven, terug te lezen en bewust te groeien.
      </p>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
