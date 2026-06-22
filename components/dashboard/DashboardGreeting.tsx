interface DashboardGreetingProps {
  username: string;
}

export function DashboardGreeting({ username }: Readonly<DashboardGreetingProps>) {
  return (
    <p className="font-serif text-2xl text-foreground md:text-3xl">
      Fijn je weer te zien, {username}
    </p>
  );
}
