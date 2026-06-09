import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
      <div className="flex flex-col gap-6">
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Ontdek jezelf met{" "}
          <span className="text-lumina-500">Lumina</span>
        </h1>
        <p className="max-w-prose text-lg leading-relaxed text-muted">
          Lumina is een rustige plek om te reflecteren. Schrijf op wat je
          bezighoudt, lees terug wanneer je wilt, en groei bewust — zonder
          afleiding.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href="#functies" variant="primary">
            Probeer gratis
          </Button>
          <Button href="#functies" variant="outline">
            Bekijk meer
          </Button>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <Image
          alt="Illustratie van iemand die 's avonds reflecteert in Lumina met een tablet"
          className="h-auto w-full rounded-2xl"
          height={765}
          priority
          src="/hero-illustration.png"
          width={1024}
        />
      </div>
    </section>
  );
}
