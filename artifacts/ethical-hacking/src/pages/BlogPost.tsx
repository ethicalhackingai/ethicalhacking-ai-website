import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertCircle, CalendarDays, Tag, User } from "lucide-react";
import { BackgroundGrid } from "@/components/background-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { supabase } from "@/lib/supabase";

interface BlogPostData {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  content: string;
  author: string;
  published_at: string;
  category: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ContentRenderer({ content }: { content: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div
        className="prose prose-invert prose-cyan max-w-none text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <div className="space-y-5 text-muted-foreground leading-relaxed">
      {content.split(/\n\n+/).map((para, i) => (
        <p key={i} className="text-sm md:text-base">
          {para.trim()}
        </p>
      ))}
    </div>
  );
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: post, isLoading, error } = useQuery<BlogPostData | null>({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, meta_title, meta_description, content, author, published_at, category")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!slug,
  });

  const pageTitle = post?.meta_title || post?.title
    ? `${post.meta_title || post.title} | EthicalHacking.ai`
    : "Blog | EthicalHacking.ai";

  const jsonLd = post
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.meta_description ?? undefined,
        author: { "@type": "Organization", name: post.author || "EthicalHacking.ai Team" },
        publisher: {
          "@type": "Organization",
          name: "EthicalHacking.ai",
          url: "https://ethicalhacking.ai",
        },
        datePublished: post.published_at,
        url: `https://ethicalhacking.ai/blog/${post.slug}`,
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        {post?.meta_description && (
          <meta name="description" content={post.meta_description} />
        )}
        <link rel="canonical" href={`https://ethicalhacking.ai/blog/${slug}`} />
        {post && (
          <>
            <meta property="og:title" content={post.meta_title || post.title} />
            {post.meta_description && (
              <meta property="og:description" content={post.meta_description} />
            )}
            <meta property="og:url" content={`https://ethicalhacking.ai/blog/${slug}`} />
            <meta property="og:type" content="article" />
          </>
        )}
        {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
      </Helmet>

      <BackgroundGrid />
      <Navbar />

      <main className="flex-1 pt-16 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-32 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Loading post…</span>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-destructive">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm font-mono">Failed to load post.</p>
              <Link href="/blog" className="text-primary text-sm hover:underline">← Back to Blog</Link>
            </div>
          )}

          {/* Not found */}
          {!isLoading && !error && !post && (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <p className="text-muted-foreground text-sm">Post not found.</p>
              <Link href="/blog" className="text-primary text-sm hover:underline">← Back to Blog</Link>
            </div>
          )}

          {/* Post */}
          {!isLoading && !error && post && (
            <>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-foreground truncate max-w-[240px]">{post.title}</span>
              </nav>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-6">
                {post.category && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(post.published_at)}
                </span>
                {post.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-8">
                {post.title}
              </h1>

              {/* Content */}
              <div className="glass-panel rounded-2xl p-6 md:p-10">
                <ContentRenderer content={post.content} />
              </div>

              {/* Back link */}
              <div className="mt-10">
                <Link
                  href="/blog"
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  ← Back to Blog
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <NewsletterSignup />
      <Footer />
    </div>
  );
}
