import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Star, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase, type AiTool } from "@/lib/supabase";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";
import { BackgroundGrid } from "@/components/background-grid";
import { cn } from "@/lib/utils";

const PRICING_BADGE: Record<string, { label: string; classes: string }> = {
  "Free/OSS": { label: "Free / OSS", classes: "bg-green-500/15 text-green-400 border-green-500/30" },
  Freemium:   { label: "Freemium",   classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  Paid:       { label: "Paid",       classes: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  Enterprise: { label: "Enterprise", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function StarRating({ rating }: { rating?: number | null }) {
  if (!rating) return null;
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("w-4 h-4", i <= filled ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40")} />
      ))}
      <span className="text-sm text-muted-foreground ml-1.5">{rating.toFixed(1)}</span>
    </div>
  );
}

function ToolLogo({ tool }: { tool: AiTool }) {
  if (tool.logo_url) {
    return (
      <img
        src={tool.logo_url}
        alt={tool.name}
        className="w-16 h-16 rounded-xl object-cover border border-border/50 shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0">
      <span className="text-primary font-bold font-mono text-xl">
        {tool.name.slice(0, 2).toUpperCase()}
      </span>
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
    queryKey: ["ai_tool", slug],
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

  const { data: related = [] } = useQuery<AiTool[]>({
    queryKey: ["ai_tools_related", tool?.category, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("id, name, slug, short_description, rating, pricing_model, logo_url, is_featured, is_new, open_source, free_trial, category, website_url")
        .eq("category", tool!.category)
        .neq("slug", slug)
        .order("rating", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tool?.category,
  });

  const pricing = tool ? (PRICING_BADGE[tool.pricing_model] ?? PRICING_BADGE.Paid) : null;

  const jsonLd = tool
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.short_description,
        url: tool.website_url,
        applicationCategory: "SecurityApplication",
        ...(tool.rating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: tool.rating,
            bestRating: 5,
            worstRating: 1,
          },
        }),
        offers: {
          "@type": "Offer",
          price: tool.pricing_model === "Free/OSS" ? "0" : undefined,
          priceCurrency: "USD",
          category: tool.pricing_model,
        },
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {tool && (
        <Helmet>
          <title>{`${tool.name} Review 2025 | AI Cybersecurity Tool | EthicalHacking.ai`}</title>
          <meta
            name="description"
            content={`${tool.short_description} Read our expert review of ${tool.name} including features, pricing, pros and cons.`}
          />
          <meta property="og:title" content={`${tool.name} - AI Cybersecurity Tool Review`} />
          <meta property="og:description" content={tool.short_description} />
          <meta property="og:url" content={`https://ethicalhacking.ai/tools/${slug}`} />
          {jsonLd && (
            <script type="application/ld+json">{jsonLd}</script>
          )}
        </Helmet>
      )}

      <BackgroundGrid />
      <Navbar />

      <main className="flex-1 pt-16 relative z-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-mono text-sm">Loading tool...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-40 gap-3 text-destructive">
            <AlertCircle className="w-10 h-10" />
            <p className="font-mono text-sm">Failed to load tool.</p>
            <Link href="/tools" className="text-primary text-sm hover:underline">← Back to Tools</Link>
          </div>
        )}

        {!isLoading && !error && !tool && (
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <p className="text-muted-foreground font-mono text-sm">Tool not found.</p>
            <Link href="/tools" className="text-primary text-sm hover:underline">← Back to Tools</Link>
          </div>
        )}

        {!isLoading && !error && tool && (
          <>
            {/* Breadcrumb */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <Link href="/tools" className="hover:text-primary transition-colors">Tools</Link>
                <span>/</span>
                <span className="text-foreground truncate max-w-[200px]">{tool.name}</span>
              </nav>
            </div>

            {/* Hero section */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Tool header */}
                <div className="flex flex-wrap items-start gap-5 mb-6">
                  <ToolLogo tool={tool} />
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
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
                        <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full uppercase tracking-wider">
                          Open Source
                        </span>
                      )}
                      {tool.free_trial && (
                        <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full uppercase tracking-wider">
                          Free Trial
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold font-display text-foreground mb-3 leading-tight">
                      {tool.name}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                      {tool.short_description}
                    </p>

                    {/* Rating + category + pricing */}
                    <div className="flex flex-wrap items-center gap-3">
                      <StarRating rating={tool.rating} />
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {tool.category}
                      </span>
                      {pricing && (
                        <span className={cn("px-3 py-1 rounded-full text-xs font-mono font-semibold border", pricing.classes)}>
                          {pricing.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300"
                  >
                    Visit {tool.name} <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    href="/tools"
                    className="flex items-center gap-2 px-6 py-3 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 font-semibold rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Tools
                  </Link>
                </div>
              </motion.div>
            </section>

            {/* Overview + Quick Facts */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="glass-panel rounded-2xl p-6">
                  <h2 className="text-lg font-bold font-display text-primary mb-4">Overview</h2>
                  <dl className="space-y-3 text-sm">
                    {[
                      { label: "Category",    value: tool.category },
                      { label: "Pricing",     value: pricing?.label ?? tool.pricing_model },
                      { label: "Rating",      value: tool.rating ? `${tool.rating} / 5` : "N/A" },
                      { label: "Open Source", value: tool.open_source ? "Yes" : "No" },
                      { label: "Free Trial",  value: tool.free_trial  ? "Yes" : "No" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center border-b border-border/30 pb-2 last:border-0 last:pb-0">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-medium text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="glass-panel rounded-2xl p-6">
                  <h2 className="text-lg font-bold font-display text-primary mb-4">Quick Facts</h2>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">✓</span>
                      {tool.pricing_model === "Free/OSS"
                        ? "Completely free to use"
                        : tool.free_trial
                        ? "Free trial available"
                        : "Contact for pricing details"}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">✓</span>
                      Category: {tool.category}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">✓</span>
                      {tool.open_source
                        ? "Source code publicly available"
                        : "Proprietary solution"}
                    </li>
                    {tool.rating && (
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        Expert rating: {tool.rating}/5
                      </li>
                    )}
                    {tool.is_featured && (
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        Featured pick by EthicalHacking.ai
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            </section>

            {/* Related Tools */}
            {related.length > 0 && (
              <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold font-display mb-6">
                    Similar{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                      {tool.category}
                    </span>{" "}
                    Tools
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {related.map((r) => {
                      const rPricing = PRICING_BADGE[r.pricing_model] ?? PRICING_BADGE.Paid;
                      return (
                        <Link
                          key={r.slug}
                          href={`/tools/${r.slug}`}
                          className="glass-panel rounded-xl p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
                        >
                          <div className="flex items-center gap-2.5 mb-2.5">
                            {r.logo_url ? (
                              <img src={r.logo_url} alt={r.name} className="w-8 h-8 rounded-lg object-cover border border-border/50 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <span className="text-primary font-bold font-mono text-xs">{r.name.slice(0, 2).toUpperCase()}</span>
                              </div>
                            )}
                            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{r.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">{r.short_description}</p>
                          <div className="flex items-center justify-between text-xs mt-auto">
                            {r.rating && (
                              <div className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-muted-foreground">{r.rating.toFixed(1)}</span>
                              </div>
                            )}
                            <span className={cn("px-1.5 py-0.5 rounded-full border font-mono text-[10px]", rPricing.classes)}>
                              {rPricing.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
