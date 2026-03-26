import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertCircle, ArrowLeftRight } from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";
import { supabase } from "@/lib/supabase";

interface ComparisonPage {
  slug: string;
  title: string;
  meta_description: string | null;
  tool_slugs: string[];
}

export default function CompareIndex() {
  const [comparisons, setComparisons] = useState<ComparisonPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("comparison_pages")
      .select("slug, title, meta_description, tool_slugs")
      .eq("status", "published")
      .order("title")
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setComparisons(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>AI Cybersecurity Tool Comparisons | EthicalHacking.ai</title>
        <meta
          name="description"
          content="Side-by-side comparisons of the best AI cybersecurity tools. Find the right tool for penetration testing, threat intelligence, cloud security, and more."
        />
        <link rel="canonical" href="https://ethicalhacking.ai/compare" />
        <meta property="og:title" content="AI Cybersecurity Tool Comparisons | EthicalHacking.ai" />
        <meta
          property="og:description"
          content="Side-by-side comparisons of the best AI cybersecurity tools."
        />
        <meta property="og:url" content="https://ethicalhacking.ai/compare" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BackgroundGrid />
      <Navbar />

      <main className="flex-1 pt-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Compare</span>
          </nav>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Tool Comparisons
            </h1>
            <p className="text-gray-400 text-lg">
              Side-by-side breakdowns to help you pick the right AI security tool.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Loading comparisons…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm font-mono">Failed to load comparisons.</p>
            </div>
          )}

          {!loading && !error && comparisons.length === 0 && (
            <div className="text-center py-24 text-muted-foreground">
              No comparisons published yet. Check back soon.
            </div>
          )}

          {!loading && !error && comparisons.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {comparisons.map((c) => (
                <Link
                  key={c.slug}
                  href={`/compare/${c.slug}`}
                  className="group glass-panel rounded-2xl p-6 hover:border-primary/40 transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <ArrowLeftRight className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                      {c.tool_slugs?.length ?? 0} tools compared
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {c.title}
                  </h2>
                  {c.meta_description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {c.meta_description}
                    </p>
                  )}
                  <span className="mt-auto text-xs font-medium text-primary">
                    View comparison →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
