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
  ${scriptTags}${jsonLd ? (Array.isArray(jsonLd) ? jsonLd.map(ld => `\n  <script type="application/ld+json">${JSON.stringify(ld)}</script>`).join('') : `\n  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`) : ''}
</head>
<body>
  <div id="root">${bodyHtml}</div>
  <footer style="background:#070b1f;border-top:1px solid #1e2a4a;padding:48px 24px 0">
    <div style="max-width:1152px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:32px;padding-bottom:40px">
      <div>
        <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;margin:0 0 16px">Tools</p>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
          <li><a href="/tools" style="font-size:14px;color:#6b7280;text-decoration:none">Browse All Tools</a></li>
          <li><a href="/tools/nmap" style="font-size:14px;color:#6b7280;text-decoration:none">Nmap</a></li>
          <li><a href="/tools/burp-suite" style="font-size:14px;color:#6b7280;text-decoration:none">Burp Suite</a></li>
          <li><a href="/tools/metasploit" style="font-size:14px;color:#6b7280;text-decoration:none">Metasploit</a></li>
          <li><a href="/tools/kali-linux" style="font-size:14px;color:#6b7280;text-decoration:none">Kali Linux</a></li>
          <li><a href="/tools/wireshark" style="font-size:14px;color:#6b7280;text-decoration:none">Wireshark</a></li>
        </ul>
      </div>
      <div>
        <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;margin:0 0 16px">Best Of</p>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
          <li><a href="/best/best-ai-penetration-testing-tools" style="font-size:14px;color:#6b7280;text-decoration:none">Best AI Pen Testing Tools</a></li>
          <li><a href="/best/best-ai-vulnerability-scanners" style="font-size:14px;color:#6b7280;text-decoration:none">Best AI Vulnerability Scanners</a></li>
          <li><a href="/best/best-free-cybersecurity-tools" style="font-size:14px;color:#6b7280;text-decoration:none">Best Free Cybersecurity Tools</a></li>
          <li><a href="/best/best-ai-osint-tools" style="font-size:14px;color:#6b7280;text-decoration:none">Best AI OSINT Tools</a></li>
          <li><a href="/best/best-ai-cloud-security-tools" style="font-size:14px;color:#6b7280;text-decoration:none">Best AI Cloud Security Tools</a></li>
          <li><a href="/best/best-ai-endpoint-security-tools" style="font-size:14px;color:#6b7280;text-decoration:none">Best AI Endpoint Security Tools</a></li>
        </ul>
      </div>
      <div>
        <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;margin:0 0 16px">Compare</p>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
          <li><a href="/compare/burp-suite-vs-owasp-zap" style="font-size:14px;color:#6b7280;text-decoration:none">Burp Suite vs OWASP ZAP</a></li>
          <li><a href="/compare/crowdstrike-vs-sentinelone" style="font-size:14px;color:#6b7280;text-decoration:none">CrowdStrike vs SentinelOne</a></li>
          <li><a href="/compare/nmap-vs-shodan" style="font-size:14px;color:#6b7280;text-decoration:none">Nmap vs Shodan</a></li>
          <li><a href="/compare/kali-linux-vs-parrot-os" style="font-size:14px;color:#6b7280;text-decoration:none">Kali Linux vs Parrot OS</a></li>
          <li><a href="/compare/hackthebox-vs-tryhackme" style="font-size:14px;color:#6b7280;text-decoration:none">HackTheBox vs TryHackMe</a></li>
        </ul>
      </div>
      <div>
        <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;margin:0 0 16px">Resources</p>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
          <li><a href="/blog" style="font-size:14px;color:#6b7280;text-decoration:none">Blog</a></li>
          <li><a href="/about" style="font-size:14px;color:#6b7280;text-decoration:none">About</a></li>
          <li><a href="/compare" style="font-size:14px;color:#6b7280;text-decoration:none">All Comparisons</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top:1px solid #1e2a4a;padding:20px 0;display:flex;justify-content:space-between;align-items:center;max-width:1152px;margin:0 auto;flex-wrap:wrap;gap:8px">
      <p style="font-size:12px;color:#4b5563;margin:0">© 2026 EthicalHacking.ai — The #1 AI Cybersecurity Tools Directory</p>
      <a href="mailto:contact@ethicalhacking.ai" style="font-size:12px;color:#4b5563;text-decoration:none;font-family:monospace">contact@ethicalhacking.ai</a>
    </div>
  </footer>
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

  const faqItems = Array.isArray(page.faq) && page.faq.length > 0 ? page.faq : [];
  const faqHtml = faqItems.length > 0 ? `
<section>
  <h2>Frequently Asked Questions</h2>
  ${faqItems.map(item => `<div>
    <h3>${esc(item.question)}</h3>
    <p>${esc(item.answer)}</p>
  </div>`).join('\n  ')}
</section>` : '';

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
  ${page.long_content ? `<section>${page.long_content}</section>` : ''}
  ${faqHtml}
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
      <p>${esc(c.tool_a_name)} vs ${esc(c.tool_b_name)}</p>
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
    .select('slug, title, meta_title, meta_description, content, author, published_at, category, faq')
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
    .select('slug, title, meta_title, meta_description, tool_a_slug, tool_a_name, tool_b_slug, tool_b_name, intro_text, verdict')
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
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'EthicalHacking.ai',
        url: SITE,
        logo: `${SITE}/logo.png`,
        description: 'The largest AI-powered cybersecurity tools directory with 500+ expert-reviewed tools for ethical hacking, penetration testing, and cyber defense.',
        founder: { '@type': 'Person', name: 'Shaariq Sami' },
        foundingDate: '2024',
        sameAs: ['https://www.linkedin.com/in/shaariqsami'],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'EthicalHacking.ai',
        url: SITE,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE}/tools?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
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

      const faqItems = Array.isArray(page.faq) && page.faq.length > 0 ? page.faq : [];
      const faqJsonLd = faqItems.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      } : null;

      savePage(`/best/${page.slug}`, buildPage({
        title: page.meta_title || page.heading,
        description: page.meta_description || page.subheading || '',
        canonical: `${SITE}/best/${page.slug}`,
        jsonLd: faqJsonLd ? [jsonLd, faqJsonLd] : jsonLd,
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
      const postPublisher = {
        '@type': 'Organization',
        name: 'EthicalHacking.ai',
        url: SITE,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE}/opengraph.jpg`,
        },
      };
      const postJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.meta_description || undefined,
        author: {
          '@type': 'Person',
          name: post.author || 'Shaariq Sami',
          url: `${SITE}/about`,
        },
        publisher: postPublisher,
        datePublished: post.published_at,
        dateModified: post.published_at,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE}/blog/${post.slug}`,
        },
        image: `${SITE}/opengraph.jpg`,
        url: `${SITE}/blog/${post.slug}`,
      };

      const faqItems = Array.isArray(post.faq) && post.faq.length > 0 ? post.faq : null;
      const faqJsonLd = faqItems
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map(item => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }
        : null;

      savePage(`/blog/${post.slug}`, buildPage({
        title: post.meta_title || `${post.title} | EthicalHacking.ai`,
        description: post.meta_description || '',
        canonical: `${SITE}/blog/${post.slug}`,
        jsonLd: faqJsonLd ? [postJsonLd, faqJsonLd] : postJsonLd,
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
      if (comp.tool_a_slug) allCompToolSlugs.add(comp.tool_a_slug);
      if (comp.tool_b_slug) allCompToolSlugs.add(comp.tool_b_slug);
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
      const slugs = [comp.tool_a_slug, comp.tool_b_slug].filter(Boolean);
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

  // 7. About page
  savePage('/about', buildPage({
    title: 'About EthicalHacking.ai — Our Mission & Methodology',
    description: 'Learn about EthicalHacking.ai, the largest AI cybersecurity tools directory with 500+ expert-reviewed tools. Our mission, rating methodology, and the team behind the platform.',
    canonical: `${SITE}/about`,
    bodyHtml: `
<nav aria-label="breadcrumb">
  <a href="/">Home</a> › <span>About</span>
</nav>
<main>
  <h1>About EthicalHacking.ai</h1>
  <p>EthicalHacking.ai is the largest AI-powered cybersecurity tools directory, built to help security professionals find the right tools faster. We catalog over 500 tools across penetration testing, red teaming, cloud security, endpoint protection, OSINT, DevSecOps, and more. Every tool is reviewed, categorized, and rated by our team.</p>

  <h2>Our Mission</h2>
  <p>The cybersecurity tool landscape is overwhelming. New AI-powered tools launch every week, and security teams waste hours evaluating options. Our mission is to be the single trusted source where penetration testers, red teamers, bug bounty hunters, and security engineers can discover, compare, and choose the best tools for their workflow.</p>

  <h2>How We Rate Tools</h2>
  <p>Every tool on EthicalHacking.ai is evaluated across five criteria: feature depth, ease of use, pricing and value, community and support, and AI capability. Ratings are on a scale of 1 to 5 and represent the consensus of our editorial team. We update ratings quarterly as tools evolve. We are editorially independent and our ratings are not influenced by vendors.</p>

  <h2>What You Will Find Here</h2>
  <p>Our platform includes 500+ individual tool reviews with detailed descriptions, 16 curated best-of lists covering every major security category, 13 head-to-head comparison pages for popular tool matchups, and a growing library of expert guides and blog articles on cybersecurity topics.</p>

  <h2>The Team</h2>
  <p>EthicalHacking.ai was founded by Shaariq Sami, a domain investor and digital entrepreneur passionate about cybersecurity and AI. The platform is maintained by a small editorial team committed to providing accurate, unbiased, and up-to-date information for the global security community.</p>

  <h2>Contact Us</h2>
  <p>Have a question, tool suggestion, or partnership inquiry? Reach out to us at contact@ethicalhacking.ai. We also welcome contributions from security professionals who want to share their expertise through guest articles or tool reviews.</p>
</main>`,
  }));
  count++;
  process.stdout.write(`\r   Pages generated: ${count}`);

  // ── Sitemap ──────────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const sitemapUrls = [
    { loc: SITE,              priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE}/tools`,   priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE}/about`,   priority: '0.8', changefreq: 'monthly' },
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
