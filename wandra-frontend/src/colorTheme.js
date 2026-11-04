// Light/dark theme. Follows the system setting until the user picks one.
import { useEffect, useState } from "react";

const KEY = "theme"; // "light" | "dark"; absent = follow the system

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function storedTheme() {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch (e) {
    return null;
  }
}

export function useColorTheme() {
  const [theme, setTheme] = useState(() => storedTheme() || (systemPrefersDark() ? "dark" : "light"));

  // Track the system setting while the user hasn't chosen.
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!storedTheme()) setTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener ? media.addEventListener("change", onChange) : media.addListener(onChange);
    return () => (media.removeEventListener ? media.removeEventListener("change", onChange) : media.removeListener(onChange));
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(KEY, next);
    } catch (e) {
      // Storage unavailable: the choice lasts for this page only.
    }
    document.documentElement.setAttribute("data-theme", next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#0f1216" : "#ff681a");
    setTheme(next);
  };

  return { theme, toggle };
}
