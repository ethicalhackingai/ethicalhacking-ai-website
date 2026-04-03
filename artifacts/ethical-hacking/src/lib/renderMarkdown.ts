/**
 * Lightweight inline markdown renderer.
 * Handles [text](url), **bold**, *italic*, `code` within text nodes.
 * Also converts markdown pipe tables to styled HTML tables.
 */

function renderInline(text: string): string {
  return text
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      (_: string, label: string, url: string) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">${label}</a>`
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 rounded text-sm font-mono">$1</code>');
}

function isTableSeparator(row: string): boolean {
  return /^\|[\s|:-]+\|$/.test(row.trim());
}

function parseCells(row: string): string[] {
  return row.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
}

function convertMarkdownTable(block: string): string {
  const rows = block.trim().split('\n');
  if (rows.length < 3) return block;

  const headerRow = rows[0];
  if (!isTableSeparator(rows[1])) return block;
  const bodyRows = rows.slice(2);

  const headerCells = parseCells(headerRow)
    .map(c =>
      `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">${renderInline(c)}</th>`
    )
    .join('');

  const bodyHtml = bodyRows
    .filter(r => r.trim())
    .map(row => {
      const cells = parseCells(row)
        .map(c =>
          `<td class="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">${renderInline(c)}</td>`
        )
        .join('');
      return `<tr class="hover:bg-gray-800/50 transition-colors">${cells}</tr>`;
    })
    .join('');

  return `<div class="overflow-x-auto my-6 rounded-lg border border-gray-700"><table class="w-full border-collapse bg-gray-900"><thead><tr class="bg-gray-800">${headerCells}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
}

/**
 * Main export. Pass any HTML or mixed HTML+markdown string.
 * - Markdown pipe tables are converted to styled HTML tables.
 * - Inline markdown ([text](url), **bold**, *italic*, `code`) in text nodes is converted.
 * - Already-HTML content (tags, attributes) is left untouched.
 */
export function processInlineMarkdown(html: string): string {
  if (!html) return html;

  // Step 1: convert markdown pipe table blocks
  const withTables = html.replace(
    /((?:\|[^\n]+\|\n?)+)/g,
    (tableBlock) => convertMarkdownTable(tableBlock)
  );

  // Step 2: process inline markdown in remaining text nodes (skips HTML tags)
  return withTables.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag;
    if (!text || !text.trim()) return match;
    return renderInline(text);
  });
}
