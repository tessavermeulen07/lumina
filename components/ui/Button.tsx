import Link from "next/link";

type ButtonVariant = "primary" | "outline" | "dark";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-lumina-300 text-lumina-900 hover:bg-lumina-100 focus-visible:outline-lumina-900",
  outline:
    "border border-lumina-500/25 text-foreground hover:border-lumina-500 hover:bg-lumina-300/15 focus-visible:outline-lumina-900",
  dark:
    "bg-lumina-900 text-surface hover:bg-lumina-700 focus-visible:outline-lumina-100",
};

interface ButtonProps {
  variant?: ButtonVariant;
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
}: Readonly<ButtonProps>) {
  const classes = `inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
