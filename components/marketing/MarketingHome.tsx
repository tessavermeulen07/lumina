import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";

export function MarketingHome() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <section
          className="mx-auto max-w-3xl px-6 py-12 text-center"
          id="over-ons"
        >
          <h2 className="mb-4 font-serif text-2xl text-foreground">
            Over Lumina
          </h2>
          <p className="leading-relaxed text-muted">
            Lumina is gebouwd voor mensen die even willen pauzeren en scherp
            willen blijven op wat hen drijft. Geen ruis, geen druk — alleen
            ruimte om na te denken en te groeien.
          </p>
        </section>
        <FeatureGrid />
        <section
          className="mx-auto max-w-3xl px-6 py-16 text-center"
          id="prijzen"
        >
          <h2 className="mb-4 font-serif text-2xl text-foreground">Prijzen</h2>
          <p className="text-muted">Lumina is tijdelijk gratis te proberen als je een uitnodigingscode hebt ontvangen..</p>
        </section>
      </main>
    </>
  );
}
