import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Footer } from '@/components/sections/footer';

interface Stack {
  slug: string;
  role_title: string;
  hero_tagline: string;
  salary_range: string;
  experience_level: string;
  certifications: string[];
}

export default function StacksIndex() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStacks() {
      const { data } = await supabase
        .from('stacks')
        .select('slug, role_title, hero_tagline, salary_range, experience_level, certifications')
        .order('created_at');
      if (data) setStacks(data);
      setLoading(false);
    }
    fetchStacks();
  }, []);

  useEffect(() => {
    document.title = 'Cybersecurity Tool Stacks by Role 2026 | EthicalHacking.ai';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Curated cybersecurity tool stacks for every role — SOC Analyst, Pen Tester, CISO, DevSecOps, and more. See the exact tools pros use in 2026.');
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Cybersecurity Tool Stacks by Role 2026',
    description: 'Curated cybersecurity tool stacks for every role.',
    url: 'https://ethicalhacking.ai/stacks',
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
        <title>Cybersecurity Tool Stacks by Role 2026 | EthicalHacking.ai</title>
        <meta name="description" content="Curated cybersecurity tool stacks for every role — SOC Analyst, Pen Tester, CISO, DevSecOps, and more." />
        <link rel="canonical" href="https://ethicalhacking.ai/stacks" />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
        <Link to="/" className="hover:text-cyan-400">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">Stacks</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Cybersecurity Tool Stacks by Role</h1>
          <p className="text-gray-300 max-w-3xl">The exact tools professionals use in 2026 — curated for {stacks.length} cybersecurity roles with salary data, certifications, and tool recommendations.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {stacks.map((stack) => (
            <Link key={stack.slug} to={`/stacks/${stack.slug}`} className="block">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-400/50 transition-colors">
                <h2 className="text-xl font-bold text-white mb-2">{stack.role_title}</h2>
                {stack.experience_level && (
                  <span className="inline-block bg-cyan-900/50 text-cyan-400 text-xs px-2 py-1 rounded mb-3">{stack.experience_level}</span>
                )}
                <p className="text-gray-400 text-sm mb-4">{stack.hero_tagline}</p>
                {stack.salary_range && (
                  <span className="inline-block bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded mr-2">{stack.salary_range}</span>
                )}
                <div className="mt-3 flex flex-wrap gap-1">
                  {(stack.certifications || []).slice(0, 3).map((cert) => (
                    <span key={cert} className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">{cert}</span>
                  ))}
                  {(stack.certifications || []).length > 3 && (
                    <span className="text-gray-500 text-xs">+{stack.certifications.length - 3} more</span>
                  )}
                </div>
                <p className="text-cyan-400 text-sm mt-4">View full stack →</p>
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
