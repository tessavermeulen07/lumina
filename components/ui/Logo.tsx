import Image from "next/image";

export function Logo() {
  return (
    <Image
      alt=""
      aria-hidden
      className="h-8 w-8"
      height={32}
      src="/logo-lumina-circle.png"
      width={32}
    />
  );
}
