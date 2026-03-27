import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { BackgroundGrid } from "@/components/background-grid";
import { Navbar } from "@/components/layout/navbar";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Footer } from "@/components/sections/footer";
import { supabase } from "../lib/supabase";

interface Tool {
  slug: string;
  name: string;
  short_description: string;
  category: string;
  pricing_model: string;
  rating: number;
  is_featured: boolean;
  is_new: boolean;
  open_source: boolean;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface BestPage {
  slug: string;
  title: string;
  heading: string;
  subheading: string;
  meta_description: string;
}

export default function Home() {
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [bestPages, setBestPages] = useState<BestPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [toolsRes, allCatsRes, bestRes] = await Promise.all([
        supabase
          .from("ai_tools")
          .select("slug, name, short_description, category, pricing_model, rating, is_featured, is_new, open_source")
          .order("rating", { ascending: false })
          .limit(8),
        supabase
          .from("ai_tools")
          .select("category")
          .limit(1000),
        supabase
          .from("best_tools_pages")
          .select("slug, title, heading, subheading, meta_description")
          .eq("status", "published")
          .order("title"),
      ]);

      if (toolsRes.data) setFeaturedTools(toolsRes.data);

      if (allCatsRes.data) {
        const counts: Record<string, number> = {};
        allCatsRes.data.forEach(({ category }) => {
          if (category) counts[category] = (counts[category] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);
        setCategories(sorted);
      }

      if (bestRes.data) setBestPages(bestRes.data);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const pricingColor = (model: string) => {
    if (model === "Free/OSS") return "text-green-400 bg-green-900/30";
    if (model === "Freemium") return "text-cyan-400 bg-cyan-900/30";
    if (model === "Enterprise") return "text-purple-400 bg-purple-900/30";
    return "text-gray-400 bg-gray-800";
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>EthicalHacking.ai — 500+ AI Cybersecurity Tools Directory | Reviews &amp; Comparisons</title>
        <meta name="description" content="Discover the best AI tools for ethical hacking, penetration testing, and cyber defense. 500+ expert-reviewed tools with ratings, comparisons, and guides." />
        <meta property="og:title" content="EthicalHacking.ai — 500+ AI Cybersecurity Tools Directory" />
        <meta property="og:description" content="Discover the best AI tools for ethical hacking, penetration testing, and cyber defense. 500+ expert-reviewed tools with ratings, comparisons, and guides." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ethicalhacking.ai" />
        <meta property="og:image" content="https://ethicalhacking.ai/opengraph.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#0A0E27" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "EthicalHacking.ai",
          "url": "https://ethicalhacking.ai",
          "logo": "https://ethicalhacking.ai/logo.png",
          "description": "The largest AI-powered cybersecurity tools directory with 500+ expert-reviewed tools.",
          "founder": { "@type": "Person", "name": "Shaariq Sami" },
          "sameAs": ["https://www.linkedin.com/in/shaariqsami"]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "EthicalHacking.ai",
          "url": "https://ethicalhacking.ai",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://ethicalhacking.ai/tools?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}</script>
      </Helmet>

      <BackgroundGrid />
      <Navbar />

      <main className="flex-1 pt-16">

        {/* ── Hero ── */}
        <section className="relative py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              500+ Tools Reviewed &amp; Rated
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
                #1 AI Cybersecurity
              </span>{" "}
              Tools Directory
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              500+ AI-powered security tools reviewed, compared, and rated by experts.
              Find the right tool for penetration testing, red teaming, cloud security, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tools"
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors shadow-[0_0_24px_rgba(0,212,255,0.35)]"
              >
                Browse All 500+ Tools →
              </Link>
              <a
                href="#best-lists"
                className="px-8 py-4 border border-cyan-500/40 text-cyan-400 font-semibold rounded-xl hover:bg-cyan-500/10 transition-colors"
              >
                View Best-Of Lists
              </a>
            </div>
          </div>
        </section>

        {/* ── Featured Tools ── */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Top-Rated Tools</h2>
                <p className="text-gray-400 mt-1">Highest-rated AI security tools this month</p>
              </div>
              <Link to="/tools" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium hidden sm:block">
                View all 500+ →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5 animate-pulse h-44" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    to={`/tools/${tool.slug}`}
                    className="group bg-gray-900 rounded-xl border border-gray-800 hover:border-cyan-600/50 transition-all duration-200 p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                        {tool.name}
                      </span>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${pricingColor(tool.pricing_model)}`}>
                        {tool.pricing_model}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1">
                      {tool.short_description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{tool.category}</span>
                      <span className="text-yellow-400 font-medium">
                        {"★".repeat(Math.floor(tool.rating))} {tool.rating}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-6 text-center sm:hidden">
              <Link to="/tools" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                View all 500+ tools →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Browse by Category ── */}
        <section className="py-16 px-4 bg-gray-900/40">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Browse by Category</h2>
              <p className="text-gray-400 mt-1">Explore tools by security domain</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-4 animate-pulse h-16" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map(({ category, count }) => (
                  <Link
                    key={category}
                    to={`/tools?category=${encodeURIComponent(category)}`}
                    className="group bg-gray-900 rounded-lg border border-gray-800 hover:border-cyan-600/50 p-4 flex items-center justify-between transition-all duration-200"
                  >
                    <span className="text-gray-200 text-sm font-medium group-hover:text-cyan-400 transition-colors leading-snug">
                      {category}
                    </span>
                    <span className="ml-2 shrink-0 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Best-Of Lists ── */}
        <section id="best-lists" className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Best-Of Lists</h2>
              <p className="text-gray-400 mt-1">Expert-curated rankings for every security use case</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5 animate-pulse h-28" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bestPages.map((page) => (
                  <Link
                    key={page.slug}
                    to={`/best/${page.slug}`}
                    className="group bg-gray-900 rounded-xl border border-gray-800 hover:border-cyan-600/50 p-5 flex flex-col gap-2 transition-all duration-200"
                  >
                    <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors leading-snug">
                      {page.heading || page.title}
                    </h3>
                    {page.meta_description && (
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {page.meta_description}
                      </p>
                    )}
                    <span className="text-cyan-400 text-xs font-medium mt-auto">
                      View list →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Newsletter ── */}
        <NewsletterSignup />

      </main>

      <Footer />
    </div>
  );
}
