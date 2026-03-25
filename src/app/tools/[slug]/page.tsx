import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: tool } = await supabase
    .from('ai_tools')
    .select('name, short_description, category')
    .eq('slug', slug)
    .single();

  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: `${tool.name} Review 2025 | AI Cybersecurity Tool | EthicalHacking.ai`,
    description: `${tool.short_description} Read our expert review of ${tool.name} including features, pricing, pros and cons.`,
    openGraph: {
      title: `${tool.name} - AI Cybersecurity Tool Review`,
      description: tool.short_description,
      url: `https://ethicalhacking.ai/tools/${slug}`,
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: tool } = await supabase
    .from('ai_tools')
    .select('*')
    .eq('slug', slug)
    .single<Tool>();

  if (!tool) notFound();

  const { data: related } = await supabase
    .from('ai_tools')
    .select('name, slug, rating, pricing_model, short_description')
    .eq('category', tool.category)
    .neq('slug', tool.slug)
    .order('rating', { ascending: false })
    .limit(4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.short_description,
    url: tool.website_url,
    applicationCategory: 'SecurityApplication',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tool.rating,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'Offer',
      price: tool.pricing_model === 'Free/OSS' ? '0' : undefined,
      priceCurrency: 'USD',
      category: tool.pricing_model,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-cyan-400">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-cyan-400">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{tool.name}</span>
        </div>

        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold">
              {tool.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{tool.name}</h1>
                {tool.is_featured && <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 rounded">FEATURED</span>}
                {tool.is_new && <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded">NEW</span>}
                {tool.open_source && <span className="px-2 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded">OPEN SOURCE</span>}
              </div>
              <p className="text-lg text-gray-300 mb-4">{tool.short_description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-yellow-400 text-lg">{'★'.repeat(Math.floor(tool.rating))}{'☆'.repeat(5 - Math.floor(tool.rating))}</span>
                <span className="text-gray-300 font-medium">{tool.rating}/5</span>
                <span className="px-3 py-1 rounded-full bg-gray-800 text-cyan-400 border border-gray-700">{tool.category}</span>
                <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">{tool.pricing_model}</span>
                {tool.free_trial && <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Free Trial</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition">Visit {tool.name} →</a>
            <Link href="/tools" className="px-6 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700 transition border border-gray-700">← Back to All Tools</Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Overview</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-400">Category</dt><dd>{tool.category}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Pricing</dt><dd>{tool.pricing_model}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Rating</dt><dd>{tool.rating}/5</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Open Source</dt><dd>{tool.open_source ? 'Yes' : 'No'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Free Trial</dt><dd>{tool.free_trial ? 'Yes' : 'No'}</dd></div>
              </dl>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Quick Facts</h2>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ {tool.pricing_model === 'Free/OSS' ? 'Completely free to use' : tool.free_trial ? 'Free trial available' : 'Contact for pricing'}</li>
                <li>✓ Category: {tool.category}</li>
                <li>✓ {tool.open_source ? 'Source code publicly available' : 'Proprietary solution'}</li>
                <li>✓ Expert rating: {tool.rating}/5</li>
                {tool.is_featured && <li>✓ Featured pick by EthicalHacking.ai</li>}
              </ul>
            </div>
          </div>
        </section>

        {related && related.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 py-8 pb-16">
            <h2 className="text-2xl font-bold mb-6">Similar {tool.category} Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/tools/${r.slug}`} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-cyan-500/50 transition group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">{r.name.charAt(0)}</div>
                    <h3 className="font-semibold text-sm group-hover:text-cyan-400 transition">{r.name}</h3>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{r.short_description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-yellow-400">{'★'.repeat(Math.floor(r.rating))}</span>
                    <span className="text-gray-500">{r.pricing_model}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
