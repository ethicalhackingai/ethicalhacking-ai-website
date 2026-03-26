import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertCircle, CalendarDays, Tag } from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  slug: string;
  title: string;
  meta_description: string;
  author: string;
  published_at: string;
  category: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug, title, meta_description, author, published_at, category")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>Cybersecurity Blog | AI Hacking Guides &amp; News | EthicalHacking.ai</title>
        <meta
          name="description"
          content="Expert guides, tutorials, and news on AI-powered cybersecurity, ethical hacking, penetration testing, and threat intelligence."
        />
        <link rel="canonical" href="https://ethicalhacking.ai/blog" />
        <meta property="og:title" content="Cybersecurity Blog | EthicalHacking.ai" />
        <meta
          property="og:description"
          content="Expert guides, tutorials, and news on AI-powered cybersecurity, ethical hacking, and penetration testing."
        />
        <meta property="og:url" content="https://ethicalhacking.ai/blog" />
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
            <span className="text-foreground">Blog</span>
          </nav>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Cybersecurity Blog
            </h1>
            <p className="text-gray-400 text-lg">
              Expert guides, tutorials, and news on AI-powered security.
            </p>
          </div>

          {/* States */}
          {loading && (
            <div className="flex items-center justify-center py-24 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Loading posts…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm font-mono">Failed to load posts.</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-24 text-muted-foreground">
              No posts published yet. Check back soon.
            </div>
          )}

          {/* Post list */}
          {!loading && !error && posts.length > 0 && (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block glass-panel rounded-2xl p-6 hover:border-primary/40 transition-all duration-200"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    {post.category && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {formatDate(post.published_at)}
                    </span>
                    {post.author && (
                      <span className="text-muted-foreground/60">{post.author}</span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                    {post.title}
                  </h2>

                  {post.meta_description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.meta_description}
                    </p>
                  )}

                  <span className="inline-block mt-4 text-xs font-medium text-primary">
                    Read article →
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
