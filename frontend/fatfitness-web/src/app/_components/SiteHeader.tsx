"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/app/_components/UserAvatar";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/_components/AuthProvider";
import { getUnreadMessageCount } from "@/lib/api";
import { useLocale, useLocalizedContent } from "@/app/_components/LocaleProvider";
import { useTheme } from "@/app/_components/ThemeProvider";
import { isLocale, localeOptions, siteCopy, siteNavigation } from "@/content/site";
import type { UserRole } from "@/types/auth";

const moderationRoles = new Set<UserRole>(["OWNER", "ADMIN", "MODERATOR"]);

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function hasModeratorAccess(roles: UserRole[]) {
  return roles.some((role) => moderationRoles.has(role));
}

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const { status, user, accessToken, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const copy = useLocalizedContent(siteCopy);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const themeIcon = theme === "dark" ? "☾" : "☀";
  const canOpenAdmin = user ? hasModeratorAccess(user.roles) : false;

  const currentNavItem = siteNavigation.find((item) => isActiveRoute(pathname, item.href));
  const currentPageLabel = currentNavItem ? copy.nav[currentNavItem.key] : copy.brand;

  // Refresh the unread-message badge on sign-in and on every navigation. The badge
  // is only rendered inside the authenticated block, so a stale count after logout
  // is never shown — no synchronous reset needed here.
  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      return;
    }
    let isActive = true;
    getUnreadMessageCount(accessToken)
      .then((result) => {
        if (isActive) setUnreadMessages(result.count);
      })
      .catch(() => {
        if (isActive) setUnreadMessages(0);
      });
    return () => {
      isActive = false;
    };
  }, [status, accessToken, pathname]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setMenuOpen(false);
    }
  }

  const pillClass =
    "flex h-10 items-center gap-1 rounded-xl border border-(--color-border) bg-(--color-surface) p-1 shadow-sm";

  return (
    <>
      <header className="site-header">
        <div className="mx-auto flex w-full max-w-6xl flex-row items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="site-brand inline-flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/photos/logo/logo-500.jpg"
              alt=""
              width={28}
              height={28}
              className="rounded-sm"
              aria-hidden="true"
            />
            {copy.brand}
          </Link>

          {/* Mobile: current page pill + burger */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="site-nav-link-active">{currentPageLabel}</span>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) text-foreground shadow-sm transition hover:bg-(--color-surface-raised)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          {/* Desktop: three pills */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Nav pill */}
            <nav aria-label="Main navigation" className={pillClass}>
              {siteNavigation.map((item) => {
                if ("requiresAuth" in item && item.requiresAuth && !user) return null;
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

            {/* Utility pill: locale + theme */}
            <div className={pillClass}>
              {localeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={locale === option.value}
                  onClick={() => {
                    if (isLocale(option.value)) setLocale(option.value);
                  }}
                  className={locale === option.value ? "site-nav-link-active" : "site-nav-link"}
                >
                  {option.value.toUpperCase()}
                </button>
              ))}
              <button
                type="button"
                aria-label={
                  nextTheme === "dark"
                    ? copy.controls.switchToDarkTheme
                    : copy.controls.switchToLightTheme
                }
                title={`${copy.controls.themeLabel}: ${copy.controls[theme]}`}
                onClick={toggleTheme}
                className="site-nav-link"
              >
                <span aria-hidden="true">{themeIcon}</span>
              </button>
            </div>

            {/* Auth pill */}
            <div className={pillClass}>
              {status === "checking" ? (
                <span className="site-nav-link" aria-live="polite">
                  {copy.account.checking}
                </span>
              ) : user ? (
                <>
                  {canOpenAdmin && (
                    <Link
                      href="/admin"
                      className={isActiveRoute(pathname, "/admin") ? "site-nav-link-active" : "site-nav-link"}
                    >
                      {copy.account.admin}
                    </Link>
                  )}
                  <Link
                    href="/messages"
                    className={`relative inline-flex items-center ${
                      isActiveRoute(pathname, "/messages") ? "site-nav-link-active" : "site-nav-link"
                    }`}
                    aria-label={copy.account.messages}
                    title={copy.account.messages}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    {unreadMessages > 0 ? (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--color-accent-strong) px-1 text-[10px] font-bold leading-none text-white">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    ) : null}
                  </Link>
                  <Link
                    href="/myplan"
                    className={isActiveRoute(pathname, "/myplan") ? "site-nav-link-active" : "site-nav-link"}
                  >
                    {copy.nav.myplan}
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center gap-1.5 ${
                      isActiveRoute(pathname, "/dashboard") ? "site-nav-link-active" : "site-nav-link"
                    }`}
                    title={user.email}
                  >
                    <UserAvatar displayName={user.displayName} userId={user.userId} hasAvatar={user.hasAvatar} size={16} />
                    {user.displayName}
                  </Link>
                  <button
                    type="button"
                    className="site-nav-link"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                  >
                    {isLoggingOut ? copy.account.logoutPending : copy.account.logout}
                  </button>
                </>
              ) : (
                <Link href="/login" className="site-nav-link">
                  {copy.account.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Site menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col overflow-y-auto bg-(--color-surface) shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-4">
              <Link
                href="/"
                className="site-brand inline-flex min-w-0 items-center gap-2 truncate"
                onClick={() => setMenuOpen(false)}
              >
                <Image
                  src="/photos/logo/logo-500.jpg"
                  alt=""
                  width={24}
                  height={24}
                  className="shrink-0 rounded-sm"
                  aria-hidden="true"
                />
                {copy.brand}
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--color-border) text-foreground transition hover:bg-(--color-surface-raised)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav section */}
            <div className="border-b border-(--color-border) px-4 py-4">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                {siteNavigation.map((item) => {
                  if ("requiresAuth" in item && item.requiresAuth && !user) return null;
                  const isActive = isActiveRoute(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`rounded-lg px-4 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-foreground font-semibold text-background"
                          : "text-(--color-muted) hover:bg-(--color-surface-raised) hover:text-foreground"
                      }`}
                    >
                      {copy.nav[item.key]}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Utility section */}
            <div className="border-b border-(--color-border) px-4 py-4">
              <div className="flex gap-2">
                {localeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={locale === option.value}
                    onClick={() => {
                      if (isLocale(option.value)) setLocale(option.value);
                    }}
                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      locale === option.value
                        ? "bg-foreground text-background"
                        : "border border-(--color-border) text-(--color-muted) hover:text-foreground"
                    }`}
                  >
                    {option.value.toUpperCase()}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label={
                    nextTheme === "dark"
                      ? copy.controls.switchToDarkTheme
                      : copy.controls.switchToLightTheme
                  }
                  title={`${copy.controls.themeLabel}: ${copy.controls[theme]}`}
                  onClick={toggleTheme}
                  className="rounded-xl border border-(--color-border) px-4 py-2.5 text-sm text-(--color-muted) transition hover:text-foreground"
                >
                  <span aria-hidden="true">{themeIcon}</span>
                </button>
              </div>
            </div>

            {/* Auth section */}
            <div className="px-4 py-4">
              {status === "checking" ? (
                <p className="px-4 py-2.5 text-sm text-(--color-muted)">{copy.account.checking}</p>
              ) : user ? (
                <div className="flex flex-col gap-1">
                  <div className="mb-1 flex items-center gap-2 rounded-xl bg-(--color-surface-raised) px-4 py-2.5">
                    <UserAvatar displayName={user.displayName} userId={user.userId} hasAvatar={user.hasAvatar} size={22} />
                    <span className="text-sm font-semibold text-foreground">{user.displayName}</span>
                  </div>
                  {canOpenAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className={`rounded-lg px-4 py-2.5 text-sm transition ${
                        isActiveRoute(pathname, "/admin")
                          ? "bg-foreground font-semibold text-background"
                          : "text-(--color-muted) hover:bg-(--color-surface-raised) hover:text-foreground"
                      }`}
                    >
                      {copy.account.admin}
                    </Link>
                  )}
                  <Link
                    href="/messages"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition ${
                      isActiveRoute(pathname, "/messages")
                        ? "bg-foreground font-semibold text-background"
                        : "text-(--color-muted) hover:bg-(--color-surface-raised) hover:text-foreground"
                    }`}
                  >
                    {copy.account.messages}
                    {unreadMessages > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--color-accent-strong) px-1.5 text-[11px] font-bold leading-none text-white">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    ) : null}
                  </Link>
                  <Link
                    href="/myplan"
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-4 py-2.5 text-sm transition ${
                      isActiveRoute(pathname, "/myplan")
                        ? "bg-foreground font-semibold text-background"
                        : "text-(--color-muted) hover:bg-(--color-surface-raised) hover:text-foreground"
                    }`}
                  >
                    {copy.nav.myplan}
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-4 py-2.5 text-sm transition ${
                      isActiveRoute(pathname, "/dashboard")
                        ? "bg-foreground font-semibold text-background"
                        : "text-(--color-muted) hover:bg-(--color-surface-raised) hover:text-foreground"
                    }`}
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    className="rounded-lg px-4 py-2.5 text-left text-sm text-(--color-muted) transition hover:bg-(--color-surface-raised) hover:text-foreground disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoggingOut ? copy.account.logoutPending : copy.account.logout}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl bg-foreground px-4 py-2.5 text-center text-sm font-semibold text-background transition hover:opacity-90"
                >
                  {copy.account.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
