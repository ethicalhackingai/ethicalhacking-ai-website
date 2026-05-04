import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Footer } from '@/components/sections/footer';

interface Tutorial {
  slug: string;
  tool_name: string;
  hero_tagline: string;
  difficulty: string;
  estimated_time: string;
  category: string;
}

export default function TutorialsIndex() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutorials() {
      const { data } = await supabase
        .from('tutorials')
        .select('slug, tool_name, hero_tagline, difficulty, estimated_time, category')
        .order('created_at');
      if (data) setTutorials(data);
      setLoading(false);
    }
    fetchTutorials();
  }, []);

  useEffect(() => {
    document.title = 'Cybersecurity Tool Tutorials 2026 | EthicalHacking.ai';
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Cybersecurity Tool Tutorials 2026',
    description: 'Step-by-step tutorials for the most popular cybersecurity tools.',
    url: 'https://ethicalhacking.ai/tutorials',
  };

  const difficultyColor = (d: string) => {
    if (d === 'Beginner') return 'bg-green-900/30 text-green-400';
    if (d === 'Intermediate') return 'bg-yellow-900/30 text-yellow-400';
    return 'bg-red-900/30 text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Helmet>
        <title>Cybersecurity Tool Tutorials 2026 | EthicalHacking.ai</title>
        <meta name="description" content="Step-by-step tutorials for Burp Suite, Nmap, Metasploit, Wireshark, and more. Learn cybersecurity tools from beginner to advanced." />
        <link rel="canonical" href="https://ethicalhacking.ai/tutorials" />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
        <Link to="/" className="hover:text-cyan-400">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">Tutorials</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Cybersecurity Tool Tutorials</h1>
          <p className="text-gray-300 max-w-3xl">Hands-on, step-by-step guides for {tutorials.length} essential cybersecurity tools — from installation to real-world workflows.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tutorials.map((t) => (
            <Link key={t.slug} to={`/tutorials/${t.slug}`} className="block">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-400/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-white">{t.tool_name}</h2>
                  <span className={`text-xs px-2 py-1 rounded ${difficultyColor(t.difficulty)}`}>{t.difficulty}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{t.hero_tagline}</p>
                <div className="flex items-center gap-3">
                  {t.estimated_time && <span className="text-gray-500 text-xs">{t.estimated_time}</span>}
                  {t.category && <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">{t.category}</span>}
                </div>
                <p className="text-cyan-400 text-sm mt-4">Start tutorial →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <NewsletterSignup />
      <Footer />
    </div>
  );
}
