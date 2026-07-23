import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-8 w-8" }: Readonly<LogoProps>) {
  return (
    <Image
      alt=""
      aria-hidden
      className={className}
      height={48}
      src="/logo-lumina-circle.png"
      width={48}
    />
  );
}
