"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="yc-new-theme-2026"
      value={{
        light: "light",
        dark: "dark"
      }}
      themes={["light", "dark"]}
    >
      {children}
    </NextThemesProvider>
  );
}
