import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Footer } from '@/components/sections/footer';

interface FaqItem { question: string; answer: string; }
interface Section { title: string; description: string; tool_slugs: string[]; }
interface Stack {
  slug: string; role_title: string; meta_title: string; meta_description: string;
  hero_tagline: string; intro: string; salary_range: string; experience_level: string;
  certifications: string[]; sections: Section[]; faq: FaqItem[];
  related_glossary_slugs: string[]; related_blog_slugs: string[];
}
interface Tool { name: string; slug: string; category: string; rating: number; short_description: string; }

export default function StackDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const [stack, setStack] = useState<Stack | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      const { data, error } = await supabase.from('stacks').select('*').eq('slug', slug).single();
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setStack(data);
      const allSlugs: string[] = [];
      if (Array.isArray(data.sections)) {
        data.sections.forEach((s: Section) => {
          if (Array.isArray(s.tool_slugs)) allSlugs.push(...s.tool_slugs);
        });
      }
      if (allSlugs.length > 0) {
        const { data: toolData } = await supabase.from('ai_tools').select('name, slug, category, rating, short_description').in('slug', allSlugs);
        if (toolData) setTools(toolData);
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (stack) {
      document.title = stack.meta_title || `${stack.role_title} Toolkit 2026 | EthicalHacking.ai`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', stack.meta_description || '');
    }
  }, [stack]);

  if (loading) {
    return (<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div></div>);
  }
  if (notFound || !stack) {
    return (<div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center"><h1 className="text-3xl font-bold mb-4">Stack Not Found</h1><Link to="/stacks" className="text-cyan-400">← Back to all stacks</Link></div>);
  }

  const toolMap = new Map(tools.map(t => [t.slug, t]));
  const faqItems: FaqItem[] = Array.isArray(stack.faq) ? stack.faq : [];
  const faqJsonLd = faqItems.length > 0 ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) } : null;
  const breadcrumbLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ethicalhacking.ai' }, { '@type': 'ListItem', position: 2, name: 'Stacks', item: 'https://ethicalhacking.ai/stacks' }, { '@type': 'ListItem', position: 3, name: stack.role_title }] };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Helmet>
        <title>{stack.meta_title}</title>
        <meta name="description" content={stack.meta_description} />
        <link rel="canonical" href={`https://ethicalhacking.ai/stacks/${stack.slug}`} />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white">EthicalHacking.ai</Link>
          <nav className="flex gap-6 text-sm">
            <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
            <Link to="/tools" className="text-gray-400 hover:text-white">Tools</Link>
            <Link to="/stacks" className="text-cyan-400">Stacks</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-2 text-sm text-gray-400">
        <Link to="/" className="hover:text-cyan-400">Home</Link><span className="mx-2">/</span>
        <Link to="/stacks" className="hover:text-cyan-400">Stacks</Link><span className="mx-2">/</span>
        <span className="text-white">{stack.role_title}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{stack.role_title} Toolkit 2026</h1>
          <p className="text-lg text-cyan-400 mb-4">{stack.hero_tagline}</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {stack.salary_range && <span className="bg-green-900/30 text-green-400 text-sm px-3 py-1 rounded">{stack.salary_range}</span>}
            {stack.experience_level && <span className="bg-cyan-900/30 text-cyan-400 text-sm px-3 py-1 rounded">{stack.experience_level}</span>}
          </div>
          {stack.certifications && stack.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stack.certifications.map(c => <span key={c} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{c}</span>)}
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none mb-10">
          <p className="text-gray-300 text-lg leading-relaxed">{stack.intro}</p>
        </div>

        {Array.isArray(stack.sections) && stack.sections.map((section, idx) => (
          <div key={idx} className="mb-10">
            <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
            <p className="text-gray-400 mb-4">{section.description}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {(section.tool_slugs || []).map(ts => {
                const tool = toolMap.get(ts);
                return tool ? (
                  <Link key={ts} to={`/tools/${tool.slug}`} className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-cyan-400/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white">{tool.name}</h3>
                      {tool.rating && <span className="text-yellow-400 text-sm">★ {tool.rating}</span>}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{tool.category}</p>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{tool.short_description}</p>
                  </Link>
                ) : (
                  <div key={ts} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-400">{ts}</h3>
                    <p className="text-gray-500 text-xs mt-1">Tool details coming soon</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {faqItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                  <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                  <p className="text-gray-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/stacks" className="text-cyan-400 hover:underline">← Back to all stacks</Link>
        </div>
      </div>

      <NewsletterSignup />
      <Footer />
    </div>
  );
            }
