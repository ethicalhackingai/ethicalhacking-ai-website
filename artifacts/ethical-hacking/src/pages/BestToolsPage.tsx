import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { supabase } from '../lib/supabase';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Footer } from '@/components/sections/footer';

interface BestToolsPage {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  heading: string;
  subheading: string;
  intro_text: string;
  target_keyword: string;
  category_filter: string;
  tool_slugs: string[];
  schema_type: string;
  status: string;
}

interface Tool {
  name: string;
  slug: string;
  category: string;
  short_description: string;
  website_url: string;
  pricing_model: string;
  rating: number;
  is_featured: boolean;
  is_new: boolean;
  open_source: boolean;
  free_trial: boolean;
}

export default function BestToolsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [page, setPage] = useState<BestToolsPage | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      const { data: pageData, error: pageError } = await supabase
        .from('best_tools_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      console.log('Page data:', pageData, 'Error:', pageError);
      if (pageError || !pageData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPage(pageData);

      let toolData: Tool[] = [];
      let slugs = pageData.tool_slugs;
      if (typeof slugs === 'string') {
        try { slugs = JSON.parse(slugs); } catch(e) { slugs = []; }
      }
      if (slugs && slugs.length > 0) {
        const { data } = await supabase
          .from('ai_tools')
          .select('*')
          .in('slug', slugs);
        if (data) {
          toolData = slugs.map((s: string) => data.find((t: any) => t.slug === s)).filter(Boolean) as Tool[];
        }
      } else if (pageData.category_filter) {
        const { data } = await supabase
          .from('ai_tools')
          .select('*')
          .eq('category', pageData.category_filter)
          .order('rating', { ascending: false })
          .limit(12);
        if (data) toolData = data;
      }
      setTools(toolData);
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (page) {
      document.title = page.meta_title || page.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', page.meta_description || '');
      else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = page.meta_description || '';
        document.head.appendChild(meta);
      }
    }
  }, [page]);

  const ratingStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    if (half) stars += '☆';
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <Link to="/tools" className="text-cyan-400 hover:underline">Browse All Tools</Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.meta_title || page.heading,
    description: page.meta_description,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `https://ethicalhacking.ai/tools/${tool.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-cyan-400">EthicalHacking.ai</Link>
          <nav className="flex gap-6 text-sm">
            <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link to="/tools" className="text-gray-300 hover:text-white">Browse AI Tools</Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-400">
        <Link to="/" className="hover:text-cyan-400">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/tools" className="hover:text-cyan-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{page.heading}</span>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-2xl p-8 border border-cyan-800/30">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{page.heading}</h1>
          <p className="text-sm text-gray-400 mb-4">Curated by EthicalHacking.ai Team · Last updated March 27, 2026</p>
          <p className="text-lg text-cyan-300 mb-4">{page.subheading}</p>
          <p className="text-gray-300 max-w-3xl leading-relaxed">{page.intro_text}</p>
          <div className="mt-4 flex gap-3 text-sm">
            <span className="bg-cyan-900/50 text-cyan-300 px-3 py-1 rounded-full">{tools.length} Tools Reviewed</span>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full">Updated March 2026</span>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="space-y-6">
          {tools.map((tool, index) => (
            <div key={tool.slug} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-cyan-700/50 transition-colors p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-cyan-900/50 rounded-lg flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Link to={`/tools/${tool.slug}`} className="text-xl font-semibold text-white hover:text-cyan-400 transition-colors">
                      {tool.name}
                    </Link>
                    {tool.is_featured && <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-full">Featured</span>}
                    {tool.is_new && <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">New</span>}
                    {tool.open_source && <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded-full">Open Source</span>}
                  </div>
                  <p className="text-gray-300 mb-3">{tool.short_description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-yellow-400">{ratingStars(tool.rating)} {tool.rating}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">{tool.category}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">{tool.pricing_model}</span>
                    {tool.free_trial && <span className="text-emerald-400 text-xs">Free Trial</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-2">
                  <Link to={`/tools/${tool.slug}`} className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm px-4 py-2 rounded-lg transition-colors text-center">
                    View Details
                  </Link>
                  {tool.website_url && (
                    <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors text-center">
                      Visit Site
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <NewsletterSignup />

        {/* Browse All Tools link */}
        <div className="mt-8 text-center">
          <Link to="/tools" className="text-cyan-400 hover:text-cyan-300 text-lg">← Browse All 500+ AI Security Tools</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
