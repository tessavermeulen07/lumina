interface DashboardGreetingProps {
  username: string;
}

export function DashboardGreeting({ username }: Readonly<DashboardGreetingProps>) {
  return (
    <p className="font-serif text-xl text-foreground sm:text-2xl lg:text-3xl">
      Fijn je weer te zien, {username}
    </p>
  );
}
