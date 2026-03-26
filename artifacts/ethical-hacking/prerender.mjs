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
function homepageBody() {
  return `
<header>
  <h1>EthicalHacking.ai — AI-Powered Cybersecurity Intelligence Platform</h1>
  <p>Your central hub for AI-powered ethical hacking and cybersecurity tools.
     Discover 500+ specialized security tools, threat intelligence resources,
     vulnerability scanners, and penetration testing platforms.</p>
  <a href="/tools">Browse AI Security Tools Directory →</a>
</header>
<section>
  <h2>Why EthicalHacking.ai?</h2>
  <ul>
    <li>500+ curated AI-powered cybersecurity tools</li>
    <li>Real-time threat intelligence and security insights</li>
    <li>Penetration testing, vulnerability scanning, and OSINT tools</li>
    <li>Regularly updated with the latest security technology</li>
  </ul>
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🔍  Fetching data from Supabase...');

  // Bulk-fetch all tools in one query
  const { data: tools, error: toolsErr } = await supabase
    .from('ai_tools')
    .select('slug, name, short_description, category, pricing_model, rating, is_featured, is_new, open_source, free_trial, website_url')
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

  // Build a slug→tool lookup for O(1) access
  const toolBySlug = Object.fromEntries(tools.map(t => [t.slug, t]));

  let count = 0;

  // 1. Homepage
  savePage('/', buildPage({
    title: 'EthicalHacking.ai - AI-Powered Cybersecurity Intelligence Platform',
    description: 'Discover 500+ AI-powered cybersecurity tools for ethical hacking, penetration testing, threat intelligence, and vulnerability scanning.',
    canonical: SITE,
    bodyHtml: homepageBody(),
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

  console.log(`\n\n✅  Pre-rendered ${count} pages into ${DIST}/`);
  console.log('   Breakdown:');
  console.log(`     1 homepage`);
  console.log(`     1 tools listing`);
  console.log(`     ${tools.length} tool detail pages`);
  console.log(`     ${(bestPages || []).length} best-tools pages`);
}

main().catch(err => { console.error(err); process.exit(1); });
