"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, siteCopy, siteNavigation, type Locale } from "@/content/site";
import { useLocale, useLocalizedContent } from "@/app/_components/LocaleProvider";
import { useTheme } from "@/app/_components/ThemeProvider";

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const copy = useLocalizedContent(siteCopy);
  const nextLocale = locale === "en" ? "de" : "en";
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <header className="site-header">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="site-brand">
          {copy.brand}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <nav
            aria-label="Main navigation"
            className="flex flex-wrap items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface) p-1 shadow-sm"
          >
            {siteNavigation.map((item) => {
              const isActive = isActiveRoute(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "site-nav-link-active" : "site-nav-link"}
                >
                  {copy.nav[item.key]}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="site-control"
            aria-label={
              nextLocale === "de"
                ? copy.controls.switchToGerman
                : copy.controls.switchToEnglish
            }
            onClick={() => setLocale(nextLocale as Locale)}
          >
            {locales.map((availableLocale) => (
              <span
                key={availableLocale}
                className={
                  availableLocale === locale
                    ? "font-semibold text-foreground"
                    : "text-(--color-muted)"
                }
              >
                {availableLocale.toUpperCase()}
              </span>
            ))}
          </button>

          <button
            type="button"
            className="site-control"
            aria-label={`${copy.controls.themeLabel}: ${copy.controls[nextTheme]}`}
            onClick={toggleTheme}
          >
            {copy.controls[theme]}
          </button>
        </div>
      </div>
    </header>
  );
}
