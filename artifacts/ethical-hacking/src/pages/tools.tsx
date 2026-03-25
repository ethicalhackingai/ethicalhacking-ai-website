import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ExternalLink, Star, Filter, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { supabase, type AiTool } from "@/lib/supabase";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";
import { BackgroundGrid } from "@/components/background-grid";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/seo";

const PRICING_OPTIONS = ["All", "Free/OSS", "Freemium", "Paid", "Enterprise"] as const;

const PRICING_BADGE: Record<string, { label: string; classes: string }> = {
  "Free/OSS": { label: "Free / OSS", classes: "bg-green-500/15 text-green-400 border-green-500/30" },
  Freemium: { label: "Freemium", classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  Paid: { label: "Paid", classes: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  Enterprise: { label: "Enterprise", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function StarRating({ rating }: { rating?: number | null }) {
  if (!rating) return null;
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i <= filled ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ToolCard({ tool }: { tool: AiTool }) {
  const pricing = PRICING_BADGE[tool.pricing_model] ?? PRICING_BADGE.Paid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative flex flex-col glass-panel rounded-2xl p-5 h-full transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,255,0.12)]",
        tool.is_featured && "border-amber-400/40 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
      )}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {tool.is_featured && (
          <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full uppercase tracking-wider">
            Featured
          </span>
        )}
        {tool.is_new && (
          <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-accent/20 text-accent border border-accent/30 rounded-full uppercase tracking-wider">
            NEW
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 mb-3">
        {tool.logo_url ? (
          <img
            src={tool.logo_url}
            alt={tool.name}
            className="w-10 h-10 rounded-lg object-cover border border-border/50 shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold font-mono text-sm">
              {tool.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-bold text-foreground truncate leading-tight">{tool.name}</h3>
          {tool.category && (
            <span className="text-xs text-muted-foreground font-mono">{tool.category}</span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
        {tool.short_description}
      </p>

      <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <span className={cn("text-xs font-mono font-semibold px-2 py-0.5 rounded-full border w-fit", pricing.classes)}>
            {pricing.label}
          </span>
          <StarRating rating={tool.rating} />
        </div>

        <a
          href={tool.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg border border-primary/20 hover:border-primary/40 transition-all shrink-0"
        >
          Visit <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

export default function Tools() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<string>("All");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: tools = [], isLoading: toolsLoading, error } = useQuery<AiTool[]>({
    queryKey: ["ai_tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name")
        .limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const categories = useMemo<string[]>(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of tools) {
      if (t.category && !seen.has(t.category)) {
        seen.add(t.category);
        result.push(t.category);
      }
    }
    return result.sort((a, b) => a.localeCompare(b));
  }, [tools]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tools.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q) && !t.short_description?.toLowerCase().includes(q)) return false;
      if (selectedCategory !== null && t.category !== selectedCategory) return false;
      if (selectedPricing !== "All" && t.pricing_model !== selectedPricing) return false;
      return true;
    });
  }, [tools, search, selectedCategory, selectedPricing]);

  const isLoading = toolsLoading;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SEO
        title="AI Security Tools Directory | EthicalHacking.ai"
        description="Browse 500+ curated AI-powered cybersecurity tools for ethical hackers and security professionals."
      />
      <BackgroundGrid />
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.1]">
              AI Security Tools{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-glow-cyan">
                Directory
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              500+ curated AI-powered cybersecurity tools across {categories.length || "multiple"} categories
            </p>
            {!isLoading && (
              <p className="text-sm font-mono text-muted-foreground">
                Showing{" "}
                <span className="text-primary font-bold">{filtered.length}</span> of{" "}
                <span className="text-foreground font-bold">{tools.length}</span> tools
              </p>
            )}
          </motion.div>
        </section>

        {/* Filters */}
        <section className="bg-background/90 backdrop-blur-xl border-b border-border/40 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            {/* Search + Pricing row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tools by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedPricing}
                  onChange={(e) => setSelectedPricing(e.target.value)}
                  className="appearance-none pl-9 pr-9 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer w-full sm:w-auto"
                >
                  {PRICING_OPTIONS.map((p) => (
                    <option key={p} value={p} className="bg-card">
                      {p === "All" ? "All Pricing" : p === "Free/OSS" ? "Free / OSS" : p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 pb-0.5 lg:flex-wrap -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  selectedCategory === null
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                )}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={cn(
                    "shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    selectedCategory === cat
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-mono text-sm">Loading tools...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
                <AlertCircle className="w-10 h-10" />
                <p className="font-mono text-sm">Failed to load tools. Please try again.</p>
              </div>
            )}

            {!isLoading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Search className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground font-mono text-sm">No tools match your filters.</p>
                <button
                  onClick={() => { setSearch(""); setSelectedCategory(null); setSelectedPricing("All"); }}
                  className="text-primary text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {!isLoading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
