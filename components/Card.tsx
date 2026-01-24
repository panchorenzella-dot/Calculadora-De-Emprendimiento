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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
      <div className="text-sm text-white/70">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {note ? <div className="mt-2 text-xs text-white/50">{note}</div> : null}
    </div>
  );
}
