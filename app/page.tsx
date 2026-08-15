import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { PartnerStrip } from "@/components/sections/PartnerStrip";
import { TrustBand } from "@/components/sections/TrustBand";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Coverage } from "@/components/sections/Coverage";
import { CallToAction } from "@/components/sections/CallToAction";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <PartnerStrip />
        <TrustBand />
        <About />
        <Services />
        <Process />
        <Coverage />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
