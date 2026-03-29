import { clsx } from "clsx";

interface StatusChipProps {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "error" | "info";
}

const toneClasses: Record<NonNullable<StatusChipProps["tone"]>, string> = {
  neutral: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
  success: "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  warning: "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  error: "border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  info: "border-cyan-300 bg-cyan-100 text-cyan-700 dark:border-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200",
};

export function StatusChip({ label, value, tone = "neutral" }: StatusChipProps) {
  return (
    <span className={clsx("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide", toneClasses[tone])}>
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </span>
  );
}
