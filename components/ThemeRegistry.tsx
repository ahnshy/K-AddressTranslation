"use client";

import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ColorModeToggle } from "@/components/ThemeToggle";

type Mode = "light" | "dark" | "night";

const palettes = {
  light: { palette: { mode: "light" as const } },
  dark:  { palette: { mode: "dark" as const } },
  night: {
    palette: {
      mode: "dark" as const,
      background: { default: "#0a0d12", paper: "#0f131a" },
      text: { primary: "#e6edf3", secondary: "#9fb1c5" },
    },
  },
};

type Ctx = { mode: Mode; setMode: (m: Mode) => void };
const ThemeModeCtx = React.createContext<Ctx | null>(null);
export const useThemeMode = () => {
  const ctx = React.useContext(ThemeModeCtx);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeRegistry");
  return ctx;
};

export function ThemeControl() {
  const { mode, setMode } = useThemeMode();
  return <ColorModeToggle mode={mode} setMode={setMode} />;
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>("night"); // default night
  const theme = React.useMemo(() => createTheme(palettes[mode] as any), [mode]);

  return (
    <ThemeModeCtx.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeCtx.Provider>
  );
}
