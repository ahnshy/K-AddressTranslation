"use client";

import { IconButton, Tooltip } from "@mui/material";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

type Mode = "light" | "dark" | "night";

export function ColorModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const next = mode === "light" ? "dark" : mode === "dark" ? "night" : "light";
  const icon = mode === "light" ? <DarkModeOutlinedIcon /> : mode === "dark" ? <NightsStayIcon /> : <LightModeOutlinedIcon />;

  return (
    <Tooltip title={`Theme: ${mode} (click to switch)`}>
      <IconButton onClick={() => setMode(next)}>{icon}</IconButton>
    </Tooltip>
  );
}
