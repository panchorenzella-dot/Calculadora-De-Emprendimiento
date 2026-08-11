export default function Card({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <div data-scenario-metric className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
      <div data-scenario-label className="text-sm font-semibold text-white/80">{title}</div>
      <div data-scenario-value className="mt-2 text-2xl font-bold">{value}</div>
      {note ? <div className="mt-2 text-xs font-medium text-white/60">{note}</div> : null}
    </div>
  );
}
