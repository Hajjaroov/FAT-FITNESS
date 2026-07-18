"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/app/_components/AuthProvider";
import { LocaleProvider } from "@/app/_components/LocaleProvider";
import { ServiceWorkerRegistration } from "@/app/_components/ServiceWorkerRegistration";
import { ThemeProvider } from "@/app/_components/ThemeProvider";

export function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <ServiceWorkerRegistration />
          {children}
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
