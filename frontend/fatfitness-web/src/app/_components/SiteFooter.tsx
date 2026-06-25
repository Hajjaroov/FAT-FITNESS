"use client";

import Link from "next/link";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { siteCopy } from "@/content/site";

export function SiteFooter() {
  const copy = useLocalizedContent(siteCopy);

  return (
    <footer className="site-footer">
      <div className="mx-auto w-full max-w-6xl px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="site-brand">{copy.brand}</p>
            <span className="site-subtle text-xs" aria-hidden="true">—</span>
            <p className="site-muted text-sm">{copy.footer.tagline}</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/impressum" className="site-footer-link">
              {copy.footer.impressum}
            </Link>
            <Link href="/privacy" className="site-footer-link">
              {copy.footer.privacy}
            </Link>
          </div>
        </div>

        <div className="site-divider mt-4 flex flex-col gap-1 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="site-subtle text-xs">{copy.footer.disclaimer}</p>
          <p className="site-subtle text-xs">{copy.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
