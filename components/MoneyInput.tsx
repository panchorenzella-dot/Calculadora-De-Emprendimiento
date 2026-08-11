import { formatARIntFromDigits, onlyDigits } from "@/lib/numberInput";

export type Currency = "ARS" | "USD";

export default function MoneyInput({
  label,
  valueDigits,
  onChangeDigits,
  hint,
  currency,
}: {
  label: string;
  valueDigits: string;
  onChangeDigits: (v: string) => void;
  hint?: string;
  currency: Currency;
}) {
  const isEmpty = valueDigits.trim() === "";
  const prefix = currency === "USD" ? "US$" : "$";

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/80">
        {label}{" "}
        {hint ? <span className="text-xs text-white/40">({hint})</span> : null}
      </span>

      <div className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 ring-1 ring-white/10 focus-within:ring-white/30">
        <span className="font-semibold text-white/55">{prefix}</span>

        <input
          aria-label={label}
          className="w-full bg-transparent font-semibold text-white outline-none placeholder:text-white/35"
          inputMode="numeric"
          value={formatARIntFromDigits(valueDigits)}
          onChange={(e) => onChangeDigits(onlyDigits(e.target.value))}
          onFocus={(e) => {
            if (!isEmpty) e.currentTarget.select();
          }}
          placeholder="0"
        />
      </div>
    </label>
  );
}
