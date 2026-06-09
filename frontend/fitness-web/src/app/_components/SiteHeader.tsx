"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, localeOptions, siteCopy, siteNavigation } from "@/content/site";
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
  const nextTheme = theme === "dark" ? "light" : "dark";
  const themeIcon = theme === "dark" ? "☾" : "☀";

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

          <div className="site-select-wrap">
            <label htmlFor="site-language" className="sr-only">
              {copy.controls.languageLabel}
            </label>
            <select
              id="site-language"
              className="site-select"
              value={locale}
              aria-label={copy.controls.languageLabel}
              onChange={(event) => {
                const selectedLocale = event.currentTarget.value;

                if (isLocale(selectedLocale)) {
                  setLocale(selectedLocale);
                }
              }}
            >
              {localeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="site-select-arrow" aria-hidden="true">
              v
            </span>
          </div>

          <button
            type="button"
            className="site-icon-control"
            aria-label={
              nextTheme === "dark"
                ? copy.controls.switchToDarkTheme
                : copy.controls.switchToLightTheme
            }
            title={`${copy.controls.themeLabel}: ${copy.controls[theme]}`}
            onClick={toggleTheme}
          >
            <span aria-hidden="true">{themeIcon}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
