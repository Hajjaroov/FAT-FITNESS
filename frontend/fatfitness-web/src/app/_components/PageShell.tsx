"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { SiteFooter } from "@/app/_components/SiteFooter";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className="site-page flex flex-col">
      <SiteHeader />
      <main
        className={`mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:py-14 ${className}`}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
