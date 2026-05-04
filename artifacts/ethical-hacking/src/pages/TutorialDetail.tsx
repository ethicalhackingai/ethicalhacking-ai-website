import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Footer } from '@/components/sections/footer';

interface FaqItem { question: string; answer: string; }
interface Section { h2: string; content: string; code_blocks?: string[]; subsections?: { h3: string; content: string; }[]; }
interface Tutorial {
  slug: string; tool_slug: string; tool_name: string; meta_title: string;
  meta_description: string; hero_tagline: string; intro: string;
  difficulty: string; estimated_time: string; prerequisites: string[];
  sections: Section[]; faq: FaqItem[]; related_tool_slugs: string[];
  related_glossary_slugs: string[]; category: string;
}

export default function TutorialDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      const { data, error } = await supabase.from('tutorials').select('*').eq('slug', slug).single();
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setTutorial(data);
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (tutorial) {
      document.title = tutorial.meta_title || `${tutorial.tool_name} Tutorial | EthicalHacking.ai`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', tutorial.meta_description || '');
    }
  }, [tutorial]);

  const difficultyColor = (d: string) => {
    if (d === 'Beginner') return 'bg-green-900/30 text-green-400';
    if (d === 'Intermediate') return 'bg-yellow-900/30 text-yellow-400';
    return 'bg-red-900/30 text-red-400';
  };

  if (loading) {
    return (<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div></div>);
  }
  if (notFound || !tutorial) {
    return (<div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center"><h1 className="text-3xl font-bold mb-4">Tutorial Not Found</h1><Link to="/tutorials" className="text-cyan-400">← Back to all tutorials</Link></div>);
  }

  const faqItems: FaqItem[] = Array.isArray(tutorial.faq) ? tutorial.faq : [];
  const faqJsonLd = faqItems.length > 0 ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) } : null;
  const breadcrumbLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ethicalhacking.ai' }, { '@type': 'ListItem', position: 2, name: 'Tutorials', item: 'https://ethicalhacking.ai/tutorials' }, { '@type': 'ListItem', position: 3, name: tutorial.tool_name }] };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Helmet>
        <title>{tutorial.meta_title}</title>
        <meta name="description" content={tutorial.meta_description} />
        <link rel="canonical" href={`https://ethicalhacking.ai/tutorials/${tutorial.slug}`} />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white">EthicalHacking.ai</Link>
          <nav className="flex gap-6 text-sm">
            <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
            <Link to="/tools" className="text-gray-400 hover:text-white">Tools</Link>
            <Link to="/tutorials" className="text-cyan-400">Tutorials</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-2 text-sm text-gray-400">
        <Link to="/" className="hover:text-cyan-400">Home</Link><span className="mx-2">/</span>
        <Link to="/tutorials" className="hover:text-cyan-400">Tutorials</Link><span className="mx-2">/</span>
        <span className="text-white">{tutorial.tool_name}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-2 py-1 rounded ${difficultyColor(tutorial.difficulty)}`}>{tutorial.difficulty}</span>
            <span className="text-gray-500 text-xs">{tutorial.estimated_time}</span>
            {tutorial.category && <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">{tutorial.category}</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{tutorial.tool_name} Tutorial</h1>
          <p className="text-lg text-cyan-400 mb-4">{tutorial.hero_tagline}</p>
          <Link to={`/tools/${tutorial.tool_slug}`} className="text-sm text-gray-400 hover:text-cyan-400">View {tutorial.tool_name} tool details →</Link>
        </div>

        <div className="prose prose-invert max-w-none mb-10">
          <p className="text-gray-300 text-lg leading-relaxed">{tutorial.intro}</p>
        </div>

        {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-10">
            <h2 className="text-xl font-bold mb-3">Prerequisites</h2>
            <ul className="space-y-2">
              {tutorial.prerequisites.map((p, i) => (
                <li key={i} className="text-gray-400 flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(tutorial.sections) && tutorial.sections.map((section, idx) => (
          <div key={idx} className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{section.h2}</h2>
            <p className="text-gray-300 leading-relaxed mb-4">{section.content}</p>
            {section.code_blocks && section.code_blocks.map((code, ci) => (
              <pre key={ci} className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto mb-4"><code className="text-sm text-green-400">{code}</code></pre>
            ))}
            {section.subsections && section.subsections.map((sub, si) => (
              <div key={si} className="ml-4 mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-200">{sub.h3}</h3>
                <p className="text-gray-400">{sub.content}</p>
              </div>
            ))}
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

        {tutorial.related_tool_slugs && tutorial.related_tool_slugs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Related Tools</h2>
            <div className="flex flex-wrap gap-2">
              {tutorial.related_tool_slugs.map(ts => (
                <Link key={ts} to={`/tools/${ts}`} className="bg-gray-900 border border-gray-800 text-gray-300 text-sm px-3 py-1.5 rounded hover:border-cyan-400/50">{ts}</Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/tutorials" className="text-cyan-400 hover:underline">← Back to all tutorials</Link>
        </div>
      </div>

      <NewsletterSignup />
      <Footer />
    </div>
  );
                  }
