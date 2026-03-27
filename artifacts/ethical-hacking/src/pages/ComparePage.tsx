import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertCircle, Star, ArrowLeftRight, ExternalLink } from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";
import { supabase, type AiTool } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ComparisonData {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  tool_a_slug: string;
  tool_a_name: string;
  tool_b_slug: string;
  tool_b_name: string;
  intro_text: string | null;
  verdict: string | null;
}

const PRICING_BADGE: Record<string, { label: string; classes: string }> = {
  "Free/OSS": { label: "Free / OSS", classes: "bg-green-500/15 text-green-400 border-green-500/30" },
  Freemium:   { label: "Freemium",   classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  Paid:       { label: "Paid",       classes: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  Enterprise: { label: "Enterprise", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function StarRating({ rating }: { rating?: number | null }) {
  if (!rating) return <span className="text-muted-foreground text-sm">N/A</span>;
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("w-3.5 h-3.5", i <= filled ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")} />
      ))}
      <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

const ROWS: { label: string; render: (t: AiTool) => React.ReactNode }[] = [
  {
    label: "Category",
    render: (t) => <span className="text-sm text-foreground">{t.category}</span>,
  },
  {
    label: "Pricing",
    render: (t) => {
      const p = PRICING_BADGE[t.pricing_model] ?? PRICING_BADGE.Paid;
      return (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-mono font-semibold border", p.classes)}>
          {p.label}
        </span>
      );
    },
  },
  {
    label: "Rating",
    render: (t) => <StarRating rating={t.rating} />,
  },
  {
    label: "Open Source",
    render: (t) => (
      <span className={cn("text-sm font-medium", t.open_source ? "text-green-400" : "text-muted-foreground")}>
        {t.open_source ? "✓ Yes" : "✗ No"}
      </span>
    ),
  },
  {
    label: "Free Trial",
    render: (t) => (
      <span className={cn("text-sm font-medium", t.free_trial ? "text-green-400" : "text-muted-foreground")}>
        {t.free_trial ? "✓ Yes" : "✗ No"}
      </span>
    ),
  },
  {
    label: "Website",
    render: (t) =>
      t.website_url ? (
        <a
          href={t.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Visit <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
];

export default function ComparePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: comparison, isLoading: cLoading, error: cError } = useQuery<ComparisonData | null>({
    queryKey: ["comparison_page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comparison_pages")
        .select("slug, title, meta_title, meta_description, tool_a_slug, tool_a_name, tool_b_slug, tool_b_name, intro_text, verdict")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!slug,
  });

  const toolSlugs = comparison ? [comparison.tool_a_slug, comparison.tool_b_slug].filter(Boolean) : [];

  const { data: tools = [], isLoading: tLoading } = useQuery<AiTool[]>({
    queryKey: ["compare_tools", toolSlugs],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("id, slug, name, short_description, category, pricing_model, rating, open_source, free_trial, website_url, logo_url, is_featured, is_new")
        .in("slug", toolSlugs);
      if (error) throw error;
      // Preserve the order from tool_a → tool_b
      const bySlug = Object.fromEntries((data ?? []).map((t) => [t.slug, t]));
      return toolSlugs.map((s) => bySlug[s]).filter(Boolean);
    },
    enabled: toolSlugs.length > 0,
  });

  const isLoading = cLoading || (toolSlugs.length > 0 && tLoading);
  const pageTitle = comparison?.meta_title || (comparison ? `${comparison.title} | EthicalHacking.ai` : "Compare Tools | EthicalHacking.ai");

  const jsonLd = comparison
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: comparison.title,
        description: comparison.meta_description ?? undefined,
        author: { "@type": "Person", name: "Shaariq Sami" },
        publisher: {
          "@type": "Organization",
          name: "EthicalHacking.ai",
          url: "https://ethicalhacking.ai",
        },
        mainEntityOfPage: `https://ethicalhacking.ai/compare/${comparison.slug}`,
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        {comparison?.meta_description && (
          <meta name="description" content={comparison.meta_description} />
        )}
        <link rel="canonical" href={`https://ethicalhacking.ai/compare/${slug}`} />
        {comparison && (
          <>
            <meta property="og:title" content={comparison.meta_title || comparison.title} />
            {comparison.meta_description && (
              <meta property="og:description" content={comparison.meta_description} />
            )}
            <meta property="og:url" content={`https://ethicalhacking.ai/compare/${slug}`} />
            <meta property="og:type" content="website" />
          </>
        )}
        {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
      </Helmet>

      <BackgroundGrid />
      <Navbar />

      <main className="flex-1 pt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-32 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Loading comparison…</span>
            </div>
          )}

          {/* Error */}
          {cError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-destructive">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm font-mono">Failed to load comparison.</p>
              <Link href="/compare" className="text-primary text-sm hover:underline">← Back to Comparisons</Link>
            </div>
          )}

          {/* Not found */}
          {!isLoading && !cError && !comparison && (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <p className="text-muted-foreground text-sm">Comparison not found.</p>
              <Link href="/compare" className="text-primary text-sm hover:underline">← Back to Comparisons</Link>
            </div>
          )}

          {!isLoading && !cError && comparison && (
            <>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <Link href="/compare" className="hover:text-primary transition-colors">Compare</Link>
                <span>/</span>
                <span className="text-foreground truncate max-w-[260px]">{comparison.title}</span>
              </nav>

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <ArrowLeftRight className="w-5 h-5" />
                  <span className="text-sm font-mono font-semibold uppercase tracking-wider">
                    {tools.length} Tools Compared
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                  {comparison.title}
                </h1>
                {comparison.intro_text && (
                  <p className="text-gray-400 text-base leading-relaxed max-w-3xl">
                    {comparison.intro_text}
                  </p>
                )}
              </div>

              {/* Tool header cards */}
              {tools.length > 0 && (
                <>
                  <div
                    className="grid gap-4 mb-8"
                    style={{ gridTemplateColumns: `repeat(${tools.length}, minmax(0, 1fr))` }}
                  >
                    {tools.map((tool) => (
                      <div key={tool.slug} className="glass-panel rounded-2xl p-5 flex flex-col gap-3">
                        {tool.logo_url ? (
                          <img
                            src={tool.logo_url}
                            alt={tool.name}
                            className="w-12 h-12 rounded-xl object-cover border border-border/50"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold font-mono text-sm">
                              {tool.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="font-bold text-foreground hover:text-primary transition-colors text-sm leading-snug"
                          >
                            {tool.name}
                          </Link>
                          {tool.short_description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {tool.short_description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comparison table */}
                  <div className="glass-panel rounded-2xl overflow-hidden mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 w-32 bg-card/50">
                            Feature
                          </th>
                          {tools.map((tool) => (
                            <th key={tool.slug} className="text-left text-sm font-bold text-foreground px-6 py-4 bg-card/50">
                              {tool.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ROWS.map((row, rowIdx) => (
                          <tr
                            key={row.label}
                            className={cn(
                              "border-b border-border/30 last:border-0",
                              rowIdx % 2 === 0 ? "bg-transparent" : "bg-card/20"
                            )}
                          >
                            <td className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                              {row.label}
                            </td>
                            {tools.map((tool) => (
                              <td key={tool.slug} className="px-6 py-4">
                                {row.render(tool)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Verdict */}
                  {comparison.verdict && (
                    <div className="glass-panel rounded-2xl p-6 md:p-8 border-primary/20">
                      <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <span>🏆</span> Our Verdict
                      </h2>
                      <div className="space-y-4 text-muted-foreground leading-relaxed">
                        {comparison.verdict.split(/\n\n+/).map((para, i) => (
                          <p key={i} className="text-sm md:text-base">{para.trim()}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Back link */}
              <div className="mt-10">
                <Link href="/compare" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                  ← Back to Comparisons
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
