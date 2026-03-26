/**
 * Static pre-render script for EthicalHacking.ai
 *
 * After `vite build`, run this to generate a complete .html file for every
 * route so crawlers receive real content rather than an empty <div id="root">.
 *
 * Usage:
 *   node prerender.mjs   (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set)
 *
 * Output: artifacts inside dist/public/
 *   /                      → dist/public/index.html          (overwritten)
 *   /tools                 → dist/public/tools/index.html
 *   /tools/<slug>          → dist/public/tools/<slug>/index.html
 *   /best/<slug>           → dist/public/best/<slug>/index.html
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist/public');
const SITE = 'https://ethicalhacking.ai';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Read the Vite-built index.html once and extract the hashed asset tags
// ---------------------------------------------------------------------------
const builtTemplate = readFileSync(join(DIST, 'index.html'), 'utf8');

// Extract the <script type="module" …> and <link rel="stylesheet" …> tags
// produced by Vite (they have content-hashed filenames we must not hardcode).
const scriptTags = [...builtTemplate.matchAll(/<script[^>]*src="\/assets\/[^"]*"[^>]*><\/script>/g)]
  .map(m => m[0]).join('\n    ');
const cssLinkTags = [...builtTemplate.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="\/assets\/[^"]*"[^>]*>/g)]
  .map(m => m[0]).join('\n    ');

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPage({ title, description, canonical, jsonLd, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:image" content="${SITE}/opengraph.jpg" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${cssLinkTags}
  ${scriptTags}${jsonLd ? `
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
  <div id="root">${bodyHtml}</div>
</body>
</html>`;
}

function savePage(urlPath, html) {
  let filePath;
  if (!urlPath || urlPath === '/') {
    filePath = join(DIST, 'index.html');
  } else {
    const segments = urlPath.replace(/^\//, '').split('/');
    const dir = join(DIST, ...segments);
    mkdirSync(dir, { recursive: true });
    filePath = join(dir, 'index.html');
  }
  writeFileSync(filePath, html, 'utf8');
}

// ---------------------------------------------------------------------------
// Body HTML generators — semantic, crawler-friendly, style-free
// ---------------------------------------------------------------------------
function homepageBody(tools, bestPages) {
  // Top 8 by rating
  const top8 = [...tools].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

  // Category counts
  const catCounts = {};
  tools.forEach(t => { if (t.category) catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
  const cats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

  const toolCards = top8
    .map(t => `<li>
      <a href="/tools/${esc(t.slug)}"><strong>${esc(t.name)}</strong></a>
      — ${esc(t.short_description || '')}
      (${esc(t.category)} · ${esc(t.pricing_model)} · ${'★'.repeat(Math.floor(t.rating || 0))} ${t.rating}/5)
    </li>`)
    .join('\n    ');

  const catLinks = cats
    .map(([cat, count]) => `<li><a href="/tools?category=${encodeURIComponent(cat)}">${esc(cat)}</a> (${count})</li>`)
    .join('\n    ');

  const bestLinks = (bestPages || [])
    .map(p => `<li>
      <a href="/best/${esc(p.slug)}"><strong>${esc(p.heading || p.title)}</strong></a>
      ${p.meta_description ? `— ${esc(p.meta_description)}` : ''}
    </li>`)
    .join('\n    ');

  return `
<header>
  <h1>The #1 AI Cybersecurity Tools Directory</h1>
  <p>500+ AI-powered security tools reviewed, compared, and rated by experts.
     Find the right tool for penetration testing, red teaming, cloud security, and more.</p>
  <a href="/tools">Browse All 500+ Tools →</a>
</header>
<section>
  <h2>Top-Rated AI Security Tools</h2>
  <ul>${toolCards}</ul>
  <a href="/tools">View all ${tools.length} tools →</a>
</section>
<section>
  <h2>Browse by Category</h2>
  <ul>${catLinks}</ul>
</section>
<section>
  <h2>Best-Of Lists</h2>
  <ul>${bestLinks}</ul>
</section>`;
}

function toolsListBody(tools) {
  const listItems = tools
    .map(t => `<li><a href="/tools/${esc(t.slug)}"><strong>${esc(t.name)}</strong></a>${t.short_description ? ` — ${esc(t.short_description)}` : ''}</li>`)
    .join('\n      ');
  return `
<header>
  <h1>AI Cybersecurity Tools Directory (${tools.length}+ Tools)</h1>
  <p>Browse our comprehensive directory of ${tools.length}+ AI-powered cybersecurity tools
     for penetration testing, threat intelligence, vulnerability scanning, network security,
     malware analysis, OSINT, and more.</p>
</header>
<main>
  <ul>
      ${listItems}
  </ul>
</main>`;
}

function toolDetailBody(tool) {
  const stars = '★'.repeat(Math.floor(tool.rating || 0));
  const badges = [
    tool.is_featured && 'Featured',
    tool.is_new && 'New',
    tool.open_source && 'Open Source',
    tool.free_trial && 'Free Trial Available',
  ].filter(Boolean).join(' · ');

  return `
<nav aria-label="breadcrumb">
  <a href="/">Home</a> › <a href="/tools">AI Tools</a> › <span>${esc(tool.name)}</span>
</nav>
<main>
  <h1>${esc(tool.name)}</h1>
  ${badges ? `<p><strong>${esc(badges)}</strong></p>` : ''}
  <p>${esc(tool.short_description)}</p>
  <table>
    <tr><th>Category</th><td>${esc(tool.category)}</td></tr>
    <tr><th>Pricing</th><td>${esc(tool.pricing_model)}</td></tr>
    <tr><th>Rating</th><td>${stars} ${tool.rating ? `${tool.rating} / 5` : ''}</td></tr>
    ${tool.open_source ? '<tr><th>License</th><td>Open Source</td></tr>' : ''}
    ${tool.free_trial ? '<tr><th>Free Trial</th><td>Yes</td></tr>' : ''}
  </table>
  ${tool.website_url ? `<p><a href="${esc(tool.website_url)}" rel="noopener noreferrer" target="_blank">Visit ${esc(tool.name)} →</a></p>` : ''}
  ${tool.long_description ? `
<section>
  <h2>Detailed Review</h2>
  ${tool.long_description.split(/\n\n+/).map(p => `<p>${esc(p.trim())}</p>`).join('\n  ')}
</section>` : ''}
</main>`;
}

function bestToolsBody(page, tools) {
  const items = tools
    .map((t, i) =>
      `<li>
        <strong>${i + 1}. <a href="/tools/${esc(t.slug)}">${esc(t.name)}</a></strong>
        ${t.short_description ? `<p>${esc(t.short_description)}</p>` : ''}
        ${t.rating ? `<p>Rating: ${'★'.repeat(Math.floor(t.rating))} ${t.rating}/5</p>` : ''}
      </li>`)
    .join('\n      ');
  return `
<nav aria-label="breadcrumb">
  <a href="/">Home</a> › <a href="/tools">AI Tools</a> › <span>${esc(page.heading)}</span>
</nav>
<main>
  <h1>${esc(page.heading)}</h1>
  ${page.subheading ? `<p>${esc(page.subheading)}</p>` : ''}
  ${page.intro_text ? `<p>${esc(page.intro_text)}</p>` : ''}
  <p>${tools.length} tools reviewed.</p>
  <ol>
      ${items}
  </ol>
</main>`;
}

function blogIndexBody(posts) {
  const items = posts
    .map(p => `<li>
      <a href="/blog/${esc(p.slug)}"><strong>${esc(p.title)}</strong></a>
      ${p.meta_description ? `<p>${esc(p.meta_description)}</p>` : ''}
      <small>${p.category ? esc(p.category) + ' · ' : ''}${p.published_at ? new Date(p.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</small>
    </li>`)
    .join('\n    ');
  return `
<nav aria-label="breadcrumb">
  <a href="/">Home</a> › <span>Blog</span>
</nav>
<main>
  <h1>Cybersecurity Blog</h1>
  <p>Expert guides, tutorials, and news on AI-powered ethical hacking, penetration testing, and cyber defense.</p>
  <ul>${items}</ul>
</main>`;
}

function blogPostBody(post) {
  const isHtml = /<[a-z][\s\S]*>/i.test(post.content);
  const contentHtml = isHtml
    ? post.content
    : post.content.split(/\n\n+/).map(p => `<p>${esc(p.trim())}</p>`).join('\n  ');
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  return `
<nav aria-label="breadcrumb">
  <a href="/">Home</a> › <a href="/blog">Blog</a> › <span>${esc(post.title)}</span>
</nav>
<article>
  <header>
    <h1>${esc(post.title)}</h1>
    ${post.category ? `<p><strong>Category:</strong> ${esc(post.category)}</p>` : ''}
    <p><strong>By</strong> ${esc(post.author || 'EthicalHacking.ai Team')} · <time>${dateStr}</time></p>
  </header>
  <section>
    ${contentHtml}
  </section>
</article>`;
}

function compareIndexBody(comparisons) {
  const items = comparisons
    .map(c => `<li>
      <a href="/compare/${esc(c.slug)}"><strong>${esc(c.title)}</strong></a>
      ${c.meta_description ? `<p>${esc(c.meta_description)}</p>` : ''}
      ${Array.isArray(c.tool_slugs) ? `<p>${c.tool_slugs.length} tools compared</p>` : ''}
    </li>`)
    .join('\n    ');
  return `
<nav aria-label="breadcrumb">
  <a href="/">Home</a> › <span>Compare</span>
</nav>
<main>
  <h1>AI Cybersecurity Tool Comparisons</h1>
  <p>Side-by-side breakdowns to help you pick the right AI security tool for your needs.</p>
  <ul>${items}</ul>
</main>`;
}

function comparePageBody(comparison, tools) {
  const rows = [
    { label: 'Category',    val: t => esc(t.category) },
    { label: 'Pricing',     val: t => esc(t.pricing_model) },
    { label: 'Rating',      val: t => t.rating ? `${'★'.repeat(Math.floor(t.rating))} ${t.rating}/5` : 'N/A' },
    { label: 'Open Source', val: t => t.open_source ? 'Yes' : 'No' },
    { label: 'Free Trial',  val: t => t.free_trial ? 'Yes' : 'No' },
  ];

  const headerCells = tools.map(t =>
    `<th><a href="/tools/${esc(t.slug)}">${esc(t.name)}</a></th>`
  ).join('');

  const tableRows = rows.map(row =>
    `<tr><th>${row.label}</th>${tools.map(t => `<td>${row.val(t)}</td>`).join('')}</tr>`
  ).join('\n    ');

  const verdictSection = comparison.verdict
    ? `\n<section>\n  <h2>Our Verdict</h2>\n  ${comparison.verdict.split(/\n\n+/).map(p => `<p>${esc(p.trim())}</p>`).join('\n  ')}\n</section>`
    : '';

  return `
<nav aria-label="breadcrumb">
  <a href="/">Home</a> › <a href="/compare">Compare</a> › <span>${esc(comparison.title)}</span>
</nav>
<main>
  <h1>${esc(comparison.title)}</h1>
  ${comparison.intro_text ? `<p>${esc(comparison.intro_text)}</p>` : ''}
  <table>
    <thead><tr><th>Feature</th>${headerCells}</tr></thead>
    <tbody>
    ${tableRows}
    </tbody>
  </table>${verdictSection}
</main>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🔍  Fetching data from Supabase...');

  // Bulk-fetch all tools in one query
  const { data: tools, error: toolsErr } = await supabase
    .from('ai_tools')
    .select('slug, name, short_description, long_description, category, pricing_model, rating, is_featured, is_new, open_source, free_trial, website_url')
    .order('name')
    .limit(1000);

  if (toolsErr) { console.error('Tools fetch error:', toolsErr); process.exit(1); }
  console.log(`   ✓ ${tools.length} tools fetched`);

  // Fetch all published best-tools pages
  const { data: bestPages, error: bestErr } = await supabase
    .from('best_tools_pages')
    .select('*')
    .eq('status', 'published');

  if (bestErr) {
    console.log(`   ⚠  best_tools_pages: ${bestErr.message} — skipping`);
  } else {
    console.log(`   ✓ ${(bestPages || []).length} best-tools pages fetched`);
  }

  // Fetch all published blog posts
  const { data: blogPosts, error: blogErr } = await supabase
    .from('blog_posts')
    .select('slug, title, meta_title, meta_description, content, author, published_at, category')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500);

  if (blogErr) {
    console.log(`   ⚠  blog_posts: ${blogErr.message} — skipping`);
  } else {
    console.log(`   ✓ ${(blogPosts || []).length} blog posts fetched`);
  }

  // Fetch all published comparison pages
  const { data: comparisonPages, error: compErr } = await supabase
    .from('comparison_pages')
    .select('slug, title, meta_title, meta_description, tool_slugs, intro_text, verdict')
    .eq('status', 'published')
    .order('title')
    .limit(500);

  if (compErr) {
    console.log(`   ⚠  comparison_pages: ${compErr.message} — skipping`);
  } else {
    console.log(`   ✓ ${(comparisonPages || []).length} comparison pages fetched`);
  }

  // Build a slug→tool lookup for O(1) access
  const toolBySlug = Object.fromEntries(tools.map(t => [t.slug, t]));

  let count = 0;

  // 1. Homepage
  savePage('/', buildPage({
    title: 'EthicalHacking.ai — 500+ AI Cybersecurity Tools Directory | Reviews & Comparisons',
    description: 'Discover the best AI tools for ethical hacking, penetration testing, and cyber defense. 500+ expert-reviewed tools with ratings, comparisons, and guides.',
    canonical: SITE,
    bodyHtml: homepageBody(tools, bestPages || []),
  }));
  count++;
  process.stdout.write(`\r   Pages generated: ${count}`);

  // 2. Tools listing
  savePage('/tools', buildPage({
    title: `AI Cybersecurity Tools Directory (${tools.length}+) | EthicalHacking.ai`,
    description: `Browse ${tools.length}+ AI-powered cybersecurity tools for penetration testing, threat intelligence, vulnerability scanning, network security, and more.`,
    canonical: `${SITE}/tools`,
    bodyHtml: toolsListBody(tools),
  }));
  count++;
  process.stdout.write(`\r   Pages generated: ${count}`);

  // 3. Individual tool pages (bulk — no extra Supabase calls needed)
  for (const tool of tools) {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.short_description,
      applicationCategory: tool.category,
      url: `${SITE}/tools/${tool.slug}`,
      offers: { '@type': 'Offer', price: tool.pricing_model === 'Free/OSS' ? '0' : undefined, priceCurrency: 'USD' },
      ...(tool.rating ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: tool.rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: 50,
        },
      } : {}),
    };

    savePage(`/tools/${tool.slug}`, buildPage({
      title: `${tool.name} - ${tool.category} AI Security Tool | EthicalHacking.ai`,
      description: tool.short_description
        ? tool.short_description.slice(0, 155)
        : `${tool.name} is an AI-powered ${tool.category} tool for cybersecurity professionals.`,
      canonical: `${SITE}/tools/${tool.slug}`,
      jsonLd,
      bodyHtml: toolDetailBody(tool),
    }));
    count++;
    if (count % 50 === 0) process.stdout.write(`\r   Pages generated: ${count}`);
  }

  // 4. Best-tools pages
  if (bestPages && bestPages.length > 0) {
    // Collect all slugs needed so we can batch-fetch tool details once
    const allNeededSlugs = new Set();
    for (const page of bestPages) {
      let slugs = page.tool_slugs;
      if (typeof slugs === 'string') { try { slugs = JSON.parse(slugs); } catch { slugs = []; } }
      (slugs || []).forEach(s => allNeededSlugs.add(s));
    }

    // Batch-fetch any tools not already in memory
    const missingSlugsList = [...allNeededSlugs].filter(s => !toolBySlug[s]);
    if (missingSlugsList.length > 0) {
      const { data: extra } = await supabase
        .from('ai_tools')
        .select('slug, name, short_description, rating')
        .in('slug', missingSlugsList);
      (extra || []).forEach(t => { toolBySlug[t.slug] = t; });
    }

    for (const page of bestPages) {
      let slugs = page.tool_slugs;
      if (typeof slugs === 'string') { try { slugs = JSON.parse(slugs); } catch { slugs = []; } }
      const pageTools = (slugs || []).map(s => toolBySlug[s]).filter(Boolean);

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': page.schema_type || 'ItemList',
        name: page.heading,
        description: page.meta_description,
        url: `${SITE}/best/${page.slug}`,
        numberOfItems: pageTools.length,
        itemListElement: pageTools.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: { '@type': 'SoftwareApplication', name: t.name, url: `${SITE}/tools/${t.slug}` },
        })),
      };

      savePage(`/best/${page.slug}`, buildPage({
        title: page.meta_title || page.heading,
        description: page.meta_description || page.subheading || '',
        canonical: `${SITE}/best/${page.slug}`,
        jsonLd,
        bodyHtml: bestToolsBody(page, pageTools),
      }));
      count++;
      process.stdout.write(`\r   Pages generated: ${count}`);
    }
  }

  // 5. Blog pages
  if (blogPosts && blogPosts.length > 0) {
    // Blog index
    savePage('/blog', buildPage({
      title: 'Cybersecurity Blog | AI Hacking Guides & News | EthicalHacking.ai',
      description: 'Expert guides, tutorials, and news on AI-powered cybersecurity, ethical hacking, penetration testing, and threat intelligence.',
      canonical: `${SITE}/blog`,
      bodyHtml: blogIndexBody(blogPosts),
    }));
    count++;
    process.stdout.write(`\r   Pages generated: ${count}`);

    // Individual blog post pages
    for (const post of blogPosts) {
      const postJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.meta_description || undefined,
        author: { '@type': 'Organization', name: post.author || 'EthicalHacking.ai Team' },
        publisher: { '@type': 'Organization', name: 'EthicalHacking.ai', url: SITE },
        datePublished: post.published_at,
        url: `${SITE}/blog/${post.slug}`,
      };
      savePage(`/blog/${post.slug}`, buildPage({
        title: post.meta_title || `${post.title} | EthicalHacking.ai`,
        description: post.meta_description || '',
        canonical: `${SITE}/blog/${post.slug}`,
        jsonLd: postJsonLd,
        bodyHtml: blogPostBody(post),
      }));
      count++;
      process.stdout.write(`\r   Pages generated: ${count}`);
    }
  }

  // 6. Comparison pages
  if (comparisonPages && comparisonPages.length > 0) {
    // Collect all tool slugs needed across all comparisons
    const allCompToolSlugs = new Set();
    for (const comp of comparisonPages) {
      const slugs = Array.isArray(comp.tool_slugs) ? comp.tool_slugs : [];
      slugs.forEach(s => allCompToolSlugs.add(s));
    }

    // Batch-fetch any comparison tools not already in memory
    const missingCompSlugs = [...allCompToolSlugs].filter(s => !toolBySlug[s]);
    if (missingCompSlugs.length > 0) {
      const { data: extra } = await supabase
        .from('ai_tools')
        .select('slug, name, short_description, category, pricing_model, rating, open_source, free_trial, website_url')
        .in('slug', missingCompSlugs);
      (extra || []).forEach(t => { toolBySlug[t.slug] = t; });
    }

    // Compare index
    savePage('/compare', buildPage({
      title: 'AI Cybersecurity Tool Comparisons | EthicalHacking.ai',
      description: 'Side-by-side comparisons of the best AI cybersecurity tools. Find the right tool for penetration testing, threat intelligence, cloud security, and more.',
      canonical: `${SITE}/compare`,
      bodyHtml: compareIndexBody(comparisonPages),
    }));
    count++;
    process.stdout.write(`\r   Pages generated: ${count}`);

    // Individual comparison pages
    for (const comp of comparisonPages) {
      const slugs = Array.isArray(comp.tool_slugs) ? comp.tool_slugs : [];
      const compTools = slugs.map(s => toolBySlug[s]).filter(Boolean);

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: comp.title,
        description: comp.meta_description || undefined,
        url: `${SITE}/compare/${comp.slug}`,
        numberOfItems: compTools.length,
        itemListElement: compTools.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: t.name,
            url: `${SITE}/tools/${t.slug}`,
            applicationCategory: 'SecurityApplication',
            ...(t.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: t.rating, bestRating: 5 } }),
          },
        })),
      };

      savePage(`/compare/${comp.slug}`, buildPage({
        title: comp.meta_title || `${comp.title} | EthicalHacking.ai`,
        description: comp.meta_description || '',
        canonical: `${SITE}/compare/${comp.slug}`,
        jsonLd,
        bodyHtml: comparePageBody(comp, compTools),
      }));
      count++;
      process.stdout.write(`\r   Pages generated: ${count}`);
    }
  }

  // ── Sitemap ──────────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const sitemapUrls = [
    { loc: SITE,              priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE}/tools`,   priority: '0.9', changefreq: 'daily' },
    ...(blogPosts && blogPosts.length > 0
      ? [{ loc: `${SITE}/blog`, priority: '0.9', changefreq: 'daily' }]
      : []),
    ...(comparisonPages && comparisonPages.length > 0
      ? [{ loc: `${SITE}/compare`, priority: '0.9', changefreq: 'weekly' }]
      : []),
    ...(bestPages || []).map(p => ({
      loc: `${SITE}/best/${p.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    ...(blogPosts || []).map(p => ({
      loc: `${SITE}/blog/${p.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    ...(comparisonPages || []).map(c => ({
      loc: `${SITE}/compare/${c.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    ...tools.map(t => ({
      loc: `${SITE}/tools/${t.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    })),
  ];

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map(({ loc, priority, changefreq }) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    ),
    '</urlset>',
  ].join('\n');

  writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml, 'utf8');
  // Also keep public/ copy in sync for dev server
  writeFileSync(join(__dirname, 'public', 'sitemap.xml'), sitemapXml, 'utf8');

  const totalUrls = sitemapUrls.length;
  console.log(`   ✓ sitemap.xml written (${totalUrls} URLs)`);

  console.log(`\n✅  Pre-rendered ${count} pages into ${DIST}/`);
  console.log('   Breakdown:');
  console.log(`     1 homepage`);
  console.log(`     1 tools listing`);
  console.log(`     ${tools.length} tool detail pages`);
  console.log(`     ${(bestPages || []).length} best-tools pages`);
  if (blogPosts && blogPosts.length > 0) {
    console.log(`     1 blog index + ${blogPosts.length} blog post pages`);
  }
  if (comparisonPages && comparisonPages.length > 0) {
    console.log(`     1 compare index + ${comparisonPages.length} comparison pages`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
