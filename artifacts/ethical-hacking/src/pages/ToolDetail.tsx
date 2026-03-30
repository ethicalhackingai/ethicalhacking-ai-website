import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  ExternalLink, Star, Tag, Shield, DollarSign,
  GitBranch, CheckCircle, Loader2, AlertCircle, ChevronRight,
} from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";
import { supabase, type AiTool } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const PRICING_BADGE: Record<string, { label: string; classes: string }> = {
  "Free/OSS": { label: "Free / OSS", classes: "bg-green-500/15 text-green-400 border-green-500/30" },
  Free:       { label: "Free",        classes: "bg-green-500/15 text-green-400 border-green-500/30" },
  Freemium:   { label: "Freemium",    classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  Paid:       { label: "Paid",        classes: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  Enterprise: { label: "Enterprise",  classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="text-sm font-semibold text-amber-400 ml-1">{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">/ 5</span>
    </div>
  );
}

export default function ToolDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: tool, isLoading, error } = useQuery<AiTool | null>({
    queryKey: ["tool", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!slug,
  });

  const pricing = tool ? (PRICING_BADGE[tool.pricing_model] ?? PRICING_BADGE.Paid) : null;

  const jsonLd = tool
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.short_description,
        applicationCategory: "SecurityApplication",
        operatingSystem: "Web",
        ...(tool.rating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: tool.rating,
            bestRating: 5,
            worstRating: 1,
            ratingCount: 100,
          },
        }),
        ...(tool.website_url && { url: tool.website_url }),
      })
    : null;

  const pageTitle = tool
    ? `${tool.name} - ${tool.category} AI Security Tool | EthicalHacking.ai`
    : "Tool | EthicalHacking.ai";
  const pageDesc = tool?.short_description ?? "AI-powered cybersecurity tool review.";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {tool && (
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDesc} />
          <link rel="canonical" href={`https://ethicalhacking.ai/tools/${tool.slug}`} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDesc} />
          <meta property="og:url" content={`https://ethicalhacking.ai/tools/${tool.slug}`} />
          {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
        </Helmet>
      )}

      <BackgroundGrid />
      <Navbar />

      <main className="flex-1 relative z-10 px-4 sm:px-6 lg:px-8 pt-28 pb-20 max-w-5xl mx-auto w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 font-mono">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tools" className="hover:text-primary transition-colors">AI Tools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{tool?.name ?? slug}</span>
        </nav>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-mono text-sm">Loading tool data…</p>
          </div>
        )}

        {/* Error / Not Found */}
        {!isLoading && (error || !tool) && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <h1 className="text-2xl font-bold">Tool not found</h1>
            <p className="text-muted-foreground text-sm max-w-md">
              We couldn't find a tool with this slug. It may have been removed or the URL is incorrect.
            </p>
            <Link
              href="/tools"
              className="mt-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 text-sm font-mono hover:bg-primary/20 transition-colors"
            >
              ← Browse all tools
            </Link>
          </div>
        )}

        {/* Tool Detail */}
        {!isLoading && tool && (
          <div className="space-y-8">

            {/* Header card */}
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">

                {/* Logo */}
                <div className="shrink-0">
                  {tool.logo_url ? (
                    <img
                      src={tool.logo_url}
                      alt={tool.name}
                      className="w-16 h-16 rounded-xl object-cover border border-border/50"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold font-mono text-xl">
                        {tool.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {tool.is_featured && (
                      <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                    {tool.is_new && (
                      <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-accent/20 text-accent border border-accent/30 rounded-full uppercase tracking-wider">
                        New
                      </span>
                    )}
                    {tool.open_source && (
                      <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-green-500/10 text-green-400 border border-green-500/30 rounded-full uppercase tracking-wider">
                        Open Source
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{tool.name}</h1>
                  <p className="text-muted-foreground text-sm font-mono mt-1">{tool.category}</p>

                  {tool.rating && (
                    <div className="mt-3">
                      <StarRating rating={tool.rating} />
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-5 text-muted-foreground leading-relaxed text-sm md:text-base">
                {tool.short_description}
              </p>

              {/* Meta pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {pricing && (
                  <span className={cn("px-3 py-1 text-xs font-mono font-semibold rounded-full border flex items-center gap-1.5", pricing.classes)}>
                    <DollarSign className="w-3 h-3" />
                    {pricing.label}
                  </span>
                )}
                {tool.free_trial && (
                  <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/30 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3" />
                    Free Trial
                  </span>
                )}
                {tool.open_source && (
                  <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full border bg-green-500/10 text-green-400 border-green-500/30 flex items-center gap-1.5">
                    <GitBranch className="w-3 h-3" />
                    Open Source
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/30 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  {tool.category}
                </span>
              </div>

              {/* CTA */}
              {tool.website_url && (
                <div className="mt-6">
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(0,212,255,0.25)]"
                  >
                    Visit {tool.name}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Features */}
            {tool.features && tool.features.length > 0 && (
              <div className="glass-panel rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Key Features
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {tool.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Long description */}
            {tool.long_description && (
              <div className="glass-panel rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-bold mb-5">Detailed Review</h2>
                <div className="prose prose-invert prose-cyan max-w-none text-muted-foreground leading-relaxed text-sm md:text-base">
                  {/<[a-z][\s\S]*>/i.test(tool.long_description) ? (
                    <div dangerouslySetInnerHTML={{ __html: tool.long_description }} />
                  ) : (
                    tool.long_description.split(/\n\n+/).map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Specs table */}
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-bold mb-5">Tool Specifications</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/40">
                  {[
                    { label: "Category", value: tool.category },
                    { label: "Pricing Model", value: pricing?.label ?? tool.pricing_model },
                    { label: "Price Range", value: tool.price_range },
                    { label: "Rating", value: tool.rating ? `${tool.rating} / 5` : null },
                    { label: "Free Trial", value: tool.free_trial ? "Yes" : null },
                    { label: "Open Source", value: tool.open_source ? "Yes" : null },
                  ]
                    .filter((r) => r.value)
                    .map((row) => (
                      <tr key={row.label}>
                        <td className="py-3 pr-6 font-mono text-xs text-muted-foreground w-36 shrink-0">
                          {row.label}
                        </td>
                        <td className="py-3 text-foreground font-medium">{row.value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Back link */}
            <div className="pt-2">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
              >
                ← Back to all tools
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
