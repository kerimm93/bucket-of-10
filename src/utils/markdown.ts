const esc = (s: string): string => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const renderMarkdown = (src: string): string => {
  const lines = src.split('\n');
  const out: string[] = [];
  let inList = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    out.push(`<p>${paragraph.join(' ')}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!inList) return;
    out.push('</ul>');
    inList = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      closeList();
      out.push(`<h3>${esc(line.slice(2))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      closeList();
      out.push(`<h4>${esc(line.slice(3))}</h4>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${esc(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }
    paragraph.push(esc(line));
  }

  flushParagraph();
  closeList();
  return out.join('');
};
