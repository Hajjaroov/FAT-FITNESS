"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/app/_components/LocaleProvider";
import { ThemeProvider } from "@/app/_components/ThemeProvider";

export function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
