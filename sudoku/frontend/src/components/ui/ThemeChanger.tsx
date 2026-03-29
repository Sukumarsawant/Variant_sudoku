import React from "react";
import { motion } from "framer-motion";
import { SunMedium, MoonStar } from "lucide-react";
import { useSudokuStore } from "../../lib/state/sudokuStore";
import { Button } from "./Button";

type Props = {
  className?: string;
};

export default function ThemeChanger({ className }: Props) {
  const theme = useSudokuStore((s) => s.theme);
  const toggleTheme = useSudokuStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <Button
      onClick={toggleTheme}
      variant="secondary"
      size="sm"
      aria-label="Toggle color theme"
      className={className}
    >
      <motion.span
        initial={false}
        animate={{ rotate: isDark ? 40 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex items-center"
      >
        {isDark ? (
          <SunMedium className="h-4 w-4" />
        ) : (
          <MoonStar className="h-4 w-4" />
        )}
      </motion.span>
      <span className="ml-2">{isDark ? "Light" : "Dark"}</span>
    </Button>
  );
}
