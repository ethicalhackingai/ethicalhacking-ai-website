import { SEO } from "@/components/seo";
import { BackgroundGrid } from "@/components/background-grid";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { Stats } from "@/components/sections/stats";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SEO />
      <BackgroundGrid />
      
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
