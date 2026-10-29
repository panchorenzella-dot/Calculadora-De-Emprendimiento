import { resultPresentation } from "@/lib/resultPresentation";
export default function Card({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note?: string;
}) {
  const presentation = resultPresentation(title, value);
  return (
    <div data-scenario-metric className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
      <div data-scenario-label data-scenario-original-label={title} className="text-sm font-semibold text-white/80">{presentation.title}</div>
      <div data-scenario-value data-tone={presentation.tone} className="mt-2 text-2xl font-bold">{value}</div>
      {note ? <div className="mt-2 text-xs font-medium text-white/60">{note}</div> : null}
    </div>
  );
}
