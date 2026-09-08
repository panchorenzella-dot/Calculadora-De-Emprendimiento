import type { ReactNode } from "react";

type AiMarkdownProps = {
  content: string;
};

const INLINE_TOKEN = /(\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE_TOKEN).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const link = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)$/);

    if (link) {
      const external = link[2].startsWith("http");
      return (
        <a
          key={key}
          href={link[2]}
          className="font-semibold text-emerald-200 underline decoration-emerald-300/35 underline-offset-4 transition hover:text-emerald-100"
          rel={external ? "noreferrer noopener" : undefined}
          target={external ? "_blank" : undefined}
        >
          {link[1]}
        </a>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key} className="font-bold text-white/95">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key} className="rounded-md border border-emerald-300/10 bg-emerald-300/[0.06] px-1.5 py-0.5 font-mono text-[0.88em] text-emerald-100">{part.slice(1, -1)}</code>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function splitTableRow(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line: string | undefined) {
  if (!line) return false;
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, "")));
}

function isBlockStart(line: string, nextLine?: string) {
  const trimmed = line.trim();
  return !trimmed
    || /^```/.test(trimmed)
    || /^#{1,4}\s+/.test(trimmed)
    || /^[-*+]\s+/.test(trimmed)
    || /^\d+[.)]\s+/.test(trimmed)
    || /^>\s?/.test(trimmed)
    || /^([-*_])\1{2,}$/.test(trimmed)
    || (trimmed.includes("|") && isTableDivider(nextLine));
}

/**
 * A deliberately small, safe Markdown renderer for the assistant's plain-text
 * API responses. It never interprets HTML and only turns http(s)/mailto links
 * into anchors, so stored model output cannot inject markup into the page.
 */
export default function AiMarkdown({ content }: AiMarkdownProps) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let lineIndex = 0;
  let blockIndex = 0;

  while (lineIndex < lines.length) {
    const rawLine = lines[lineIndex] ?? "";
    const line = rawLine.trim();

    if (!line) {
      lineIndex += 1;
      continue;
    }

    const blockKey = `markdown-${blockIndex}`;
    blockIndex += 1;

    const fence = line.match(/^```([^\s`]*)/);
    if (fence) {
      const language = fence[1] || "texto";
      const codeLines: string[] = [];
      lineIndex += 1;
      while (lineIndex < lines.length && !(lines[lineIndex] ?? "").trim().startsWith("```")) {
        codeLines.push(lines[lineIndex] ?? "");
        lineIndex += 1;
      }
      if (lineIndex < lines.length) lineIndex += 1;
      blocks.push(
        <div key={blockKey} className="my-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/35">
          <div className="border-b border-white/[0.07] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">{language}</div>
          <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-emerald-50/80"><code>{codeLines.join("\n")}</code></pre>
        </div>
      );
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)/);
    if (heading) {
      const level = heading[1].length;
      const headingContent = renderInline(heading[2], blockKey);
      const headingClass = "mb-2 mt-7 scroll-mt-24 font-bold tracking-[-0.02em] text-white first:mt-0";
      if (level === 1) blocks.push(<h2 key={blockKey} className={`${headingClass} text-xl sm:text-2xl`}>{headingContent}</h2>);
      else if (level === 2) blocks.push(<h3 key={blockKey} className={`${headingClass} text-lg sm:text-xl`}>{headingContent}</h3>);
      else blocks.push(<h4 key={blockKey} className={`${headingClass} text-base`}>{headingContent}</h4>);
      lineIndex += 1;
      continue;
    }

    if (/^([-*_])\1{2,}$/.test(line)) {
      blocks.push(<hr key={blockKey} className="my-6 border-0 border-t border-white/[0.08]" />);
      lineIndex += 1;
      continue;
    }

    if (line.includes("|") && isTableDivider(lines[lineIndex + 1])) {
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      lineIndex += 2;
      while (lineIndex < lines.length) {
        const row = (lines[lineIndex] ?? "").trim();
        if (!row || !row.includes("|") || isBlockStart(row, lines[lineIndex + 1])) break;
        rows.push(splitTableRow(row));
        lineIndex += 1;
      }
      blocks.push(
        <div key={blockKey} className="my-5 overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <thead className="bg-emerald-300/[0.055] text-white/85">
              <tr>{headers.map((cell, index) => <th key={`${blockKey}-head-${index}`} className="border-b border-white/[0.08] px-4 py-3 font-semibold">{renderInline(cell, `${blockKey}-head-${index}`)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((row, rowIndex) => <tr key={`${blockKey}-row-${rowIndex}`} className="transition-colors hover:bg-white/[0.025]">{headers.map((_, cellIndex) => <td key={`${blockKey}-cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-white/68">{renderInline(row[cellIndex] ?? "", `${blockKey}-cell-${rowIndex}-${cellIndex}`)}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (lineIndex < lines.length) {
        const item = (lines[lineIndex] ?? "").trim().match(/^[-*+]\s+(.+)/);
        if (!item) break;
        items.push(item[1]);
        lineIndex += 1;
      }
      blocks.push(
        <ul key={blockKey} className="my-4 space-y-2.5 pl-1">
          {items.map((item, index) => <li key={`${blockKey}-${index}`} className="grid grid-cols-[8px_minmax(0,1fr)] gap-3 text-white/72"><span aria-hidden="true" className="mt-[0.66rem] h-1.5 w-1.5 rounded-full bg-emerald-300/75"/><span>{renderInline(item, `${blockKey}-${index}`)}</span></li>)}
        </ul>
      );
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (lineIndex < lines.length) {
        const item = (lines[lineIndex] ?? "").trim().match(/^\d+[.)]\s+(.+)/);
        if (!item) break;
        items.push(item[1]);
        lineIndex += 1;
      }
      blocks.push(
        <ol key={blockKey} className="my-4 list-decimal space-y-2.5 pl-6 marker:font-bold marker:text-emerald-200/70">
          {items.map((item, index) => <li key={`${blockKey}-${index}`} className="pl-1 text-white/72">{renderInline(item, `${blockKey}-${index}`)}</li>)}
        </ol>
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (lineIndex < lines.length) {
        const quote = (lines[lineIndex] ?? "").trim().match(/^>\s?(.*)/);
        if (!quote) break;
        quoteLines.push(quote[1]);
        lineIndex += 1;
      }
      blocks.push(
        <blockquote key={blockKey} className="my-5 border-l-2 border-emerald-300/45 bg-emerald-300/[0.035] px-4 py-3 text-white/68">
          {renderInline(quoteLines.join(" "), blockKey)}
        </blockquote>
      );
      continue;
    }

    const paragraphLines = [line];
    lineIndex += 1;
    while (lineIndex < lines.length && !isBlockStart(lines[lineIndex] ?? "", lines[lineIndex + 1])) {
      paragraphLines.push((lines[lineIndex] ?? "").trim());
      lineIndex += 1;
    }
    blocks.push(<p key={blockKey} className="my-3 text-white/72">{renderInline(paragraphLines.join(" "), blockKey)}</p>);
  }

  return <div className="min-w-0 break-words text-[15px] leading-7 sm:text-base sm:leading-7">{blocks}</div>;
}
