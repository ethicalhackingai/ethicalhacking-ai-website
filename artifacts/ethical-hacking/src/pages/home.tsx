import { SEO } from "@/components/seo";
import { BackgroundGrid } from "@/components/background-grid";
import { Navbar } from "@/components/layout/navbar";
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
      <Navbar />
      
      <main className="flex-1 pt-16">
        <Hero />
        <Stats />
        <Features />
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
