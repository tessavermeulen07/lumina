export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="marketing-aura flex min-h-full flex-col">{children}</div>;
}
