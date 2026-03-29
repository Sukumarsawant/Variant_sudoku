import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./Button";
import { useSudokuStore } from "../../lib/state/sudokuStore";

const iconByTone = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

const styleByTone = {
  info: "border-cyan-300/70 bg-cyan-100/90 text-cyan-900 dark:border-cyan-700 dark:bg-cyan-900/80 dark:text-cyan-100",
  success: "border-emerald-300/70 bg-emerald-100/90 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-100",
  warning: "border-amber-300/70 bg-amber-100/90 text-amber-900 dark:border-amber-700 dark:bg-amber-900/80 dark:text-amber-100",
  error: "border-rose-300/70 bg-rose-100/90 text-rose-900 dark:border-rose-700 dark:bg-rose-900/80 dark:text-rose-100",
};

export function ToastHost() {
  const toasts = useSudokuStore((state) => state.toasts);
  const dismissToast = useSudokuStore((state) => state.dismissToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), toast.tone === "error" ? 5500 : 3200),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, dismissToast]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconByTone[toast.tone];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className={`pointer-events-auto rounded-xl border p-3 shadow-glass ${styleByTone[toast.tone]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.detail && <p className="mt-0.5 text-xs opacity-90">{toast.detail}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 !px-0 !py-0 rounded-full opacity-80 hover:opacity-100"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
