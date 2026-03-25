import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ethicalhacking.ai';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
  ];

  const { data: tools } = await supabase.from('ai_tools').select('slug');
  const toolPages = (tools || []).map((t) => ({
    url: `${baseUrl}/tools/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const { data: bestPages } = await supabase.from('best_tools_pages').select('slug');
  const bestToolPages = (bestPages || []).map((p) => ({
    url: `${baseUrl}/best/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const { data: compPages } = await supabase.from('comparison_pages').select('slug');
  const comparisonPages = (compPages || []).map((p) => ({
    url: `${baseUrl}/compare/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages, ...bestToolPages, ...comparisonPages];
}
