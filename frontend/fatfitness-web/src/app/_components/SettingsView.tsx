"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AvatarUpload } from "@/app/_components/AvatarUpload";
import { CountryCombobox } from "@/app/_components/CountryCombobox";
import { PageShell } from "@/app/_components/PageShell";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { settingsCopy } from "@/content/settings";
import {
  ApiError,
  changePassword,
  revokeAllSessions,
  subscribeToPush,
  unsubscribeFromPush,
  updateNotificationPreferences,
  updateProfile,
} from "@/lib/api";
import { vapidPublicKey } from "@/lib/config";
import { isIosDevice, isStandaloneDisplayMode, urlBase64ToUint8Array } from "@/lib/push";

type SectionStatus = "idle" | "pending" | "success" | "error";

function ProfileSection() {
  const copy = useLocalizedContent(settingsCopy);
  const { user, accessToken, refreshUser } = useAuth();
  const [status, setStatus] = useState<SectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const displayName = (formData.get("display-name") as string | null)?.trim() ?? "";
    const countryInput = event.currentTarget.querySelector<HTMLInputElement>("[data-country-code]");
    const countryRegionCode = countryInput?.dataset.countryCode ?? "";

    if (!displayName) {
      setError(copy.profile.errorFallback);
      setStatus("error");
      return;
    }

    if (!countryRegionCode) {
      setError(copy.profile.errorFallback);
      setStatus("error");
      return;
    }

    setStatus("pending");
    setError(null);

    try {
      await updateProfile({ displayName, countryRegionCode }, accessToken);
      await refreshUser();
      setStatus("success");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : copy.profile.errorFallback,
      );
      setStatus("error");
    }
  }

  if (!user || !accessToken) {
    return null;
  }

  return (
    <section className="site-card overflow-hidden">
      <header className="site-divider border-b p-6 sm:p-7">
        <h2 className="text-xl font-semibold">{copy.profile.title}</h2>
      </header>
      <div className="site-divider border-b p-6 sm:p-7">
        <p className="mb-4 text-sm font-semibold text-foreground">{copy.avatar.title}</p>
        <AvatarUpload
          userId={user.userId}
          hasAvatar={user.hasAvatar}
          displayName={user.displayName}
          onUploaded={() => void refreshUser()}
        />
      </div>
      <form onSubmit={handleSubmit} className="p-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="display-name"
              className="text-sm font-semibold text-foreground"
            >
              {copy.profile.displayNameLabel}
            </label>
            <input
              id="display-name"
              name="display-name"
              type="text"
              required
              maxLength={80}
              defaultValue={user.displayName}
              placeholder={copy.profile.displayNamePlaceholder}
              className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
            />
          </div>
          <CountryCombobox
            id="settings-country"
            label={copy.profile.countryLabel}
            placeholder={copy.profile.countryPlaceholder}
            searchHint={copy.profile.countrySearchHint}
            noResultsLabel={copy.profile.countryNoResults}
            initialCode={user.countryRegionCode}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={status === "pending"}
            className="min-h-11 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {status === "pending"
              ? copy.profile.savingLabel
              : copy.profile.saveLabel}
          </button>
          {status === "success" ? (
            <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
              {copy.profile.successMessage}
            </p>
          ) : null}
          {status === "error" ? (
            <p role="alert" className="text-sm text-red-800 dark:text-red-300">
              {error ?? copy.profile.errorFallback}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

function PasswordSection() {
  const copy = useLocalizedContent(settingsCopy);
  const { accessToken, logout } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<SectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const currentPassword = (formData.get("current-password") as string) ?? "";
    const newPassword = (formData.get("new-password") as string) ?? "";
    const confirmPassword = (formData.get("confirm-password") as string) ?? "";

    if (newPassword.length < 8) {
      setError(copy.password.tooShortError);
      setStatus("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(copy.password.mismatchError);
      setStatus("error");
      return;
    }

    setStatus("pending");
    setError(null);

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword }, accessToken);
      setStatus("success");
      await logout();
      router.push("/login");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : copy.password.errorFallback,
      );
      setStatus("error");
    }
  }

  if (!accessToken) {
    return null;
  }

  return (
    <section className="site-card overflow-hidden">
      <header className="site-divider border-b p-6 sm:p-7">
        <h2 className="text-xl font-semibold">{copy.password.title}</h2>
      </header>
      <form onSubmit={handleSubmit} className="p-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="current-password"
              className="text-sm font-semibold text-foreground"
            >
              {copy.password.currentLabel}
            </label>
            <input
              id="current-password"
              name="current-password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="text-sm font-semibold text-foreground"
            >
              {copy.password.newLabel}
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="text-sm font-semibold text-foreground"
            >
              {copy.password.confirmLabel}
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              className="mt-2 min-h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={status === "pending"}
            className="min-h-11 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {status === "pending"
              ? copy.password.savingLabel
              : copy.password.saveLabel}
          </button>
          {status === "error" ? (
            <p role="alert" className="text-sm text-red-800 dark:text-red-300">
              {error ?? copy.password.errorFallback}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

type PushSupportState = "checking" | "unsupported" | "ios-not-installed" | "supported";

function PushToggleRow() {
  const copy = useLocalizedContent(settingsCopy);
  const { accessToken } = useAuth();
  const [support, setSupport] = useState<PushSupportState>("checking");
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<SectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function checkState() {
      const apiAvailable =
        "serviceWorker" in navigator && "PushManager" in window && Boolean(vapidPublicKey);

      if (!apiAvailable) {
        if (isActive) setSupport("unsupported");
        return;
      }

      if (isIosDevice() && !isStandaloneDisplayMode()) {
        if (isActive) setSupport("ios-not-installed");
        return;
      }

      if (isActive) {
        setSupport("supported");
        setPermissionDenied(Notification.permission === "denied");
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (isActive) setChecked(Boolean(subscription));
      } catch {
        // Leave the toggle unchecked — the user can still try to enable it.
      }
    }

    void checkState();
    return () => {
      isActive = false;
    };
  }, []);

  async function handleEnable() {
    if (!accessToken) return;
    setStatus("pending");
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPermissionDenied(permission === "denied");
        setStatus("idle");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Push subscription is missing required fields");
      }

      await subscribeToPush(
        { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
        accessToken,
      );
      setChecked(true);
      setStatus("success");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : copy.notifications.pushErrorFallback,
      );
      setStatus("error");
    }
  }

  async function handleDisable() {
    if (!accessToken) return;
    setStatus("pending");
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint, accessToken);
        await subscription.unsubscribe();
      }
      setChecked(false);
      setStatus("success");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : copy.notifications.pushErrorFallback,
      );
      setStatus("error");
    }
  }

  if (support === "checking" || support === "unsupported") {
    return null;
  }

  if (support === "ios-not-installed") {
    return (
      <div className="mt-5 flex items-start gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{copy.notifications.pushLabel}</p>
          <p className="mt-1 text-sm leading-6 text-(--color-subtle)">
            {copy.notifications.pushIosHint}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 flex items-start gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={copy.notifications.pushLabel}
        disabled={status === "pending" || permissionDenied}
        onClick={() => void (checked ? handleDisable() : handleEnable())}
        className={`relative mt-0.5 h-6 w-11 flex-none rounded-xl border-2 transition focus-visible:ring-2 focus-visible:ring-(--color-accent)/50 disabled:cursor-not-allowed disabled:opacity-60 ${
          checked
            ? "border-(--color-accent) bg-(--color-accent)"
            : "border-(--color-border) bg-(--color-border)"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-[calc(100%-1.25rem)]" : "left-0.5"
          }`}
        />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{copy.notifications.pushLabel}</p>
        <p className="mt-1 text-sm leading-6 text-(--color-subtle)">
          {permissionDenied ? copy.notifications.pushPermissionDeniedHint : copy.notifications.pushHint}
        </p>
        {status === "success" ? (
          <p role="status" className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
            {copy.notifications.pushSuccessMessage}
          </p>
        ) : null}
        {status === "error" ? (
          <p role="alert" className="mt-2 text-xs text-red-800 dark:text-red-300">
            {error ?? copy.notifications.pushErrorFallback}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function NotificationsSection() {
  const copy = useLocalizedContent(settingsCopy);
  const { user, accessToken, refreshUser } = useAuth();
  const [status, setStatus] = useState<SectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean>(user?.emailNotificationsPm ?? true);

  if (!user || !accessToken) {
    return null;
  }

  async function handleChange(next: boolean) {
    if (!accessToken) return;
    setChecked(next);
    setStatus("pending");
    setError(null);
    try {
      await updateNotificationPreferences({ emailNotificationsPm: next }, accessToken);
      await refreshUser();
      setStatus("success");
    } catch (caughtError) {
      setChecked(!next);
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : copy.notifications.errorFallback,
      );
      setStatus("error");
    }
  }

  return (
    <section className="site-card p-6 sm:p-7">
      <h2 className="text-xl font-semibold">{copy.notifications.title}</h2>
      <div className="mt-5 flex items-start gap-4">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={status === "pending"}
          onClick={() => void handleChange(!checked)}
          className={`relative mt-0.5 h-6 w-11 flex-none rounded-xl border-2 transition focus-visible:ring-2 focus-visible:ring-(--color-accent)/50 disabled:cursor-wait ${
            checked
              ? "border-(--color-accent) bg-(--color-accent)"
              : "border-(--color-border) bg-(--color-border)"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
              checked ? "left-[calc(100%-1.25rem)]" : "left-0.5"
            }`}
          />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {copy.notifications.pmEmailLabel}
          </p>
          <p className="mt-1 text-sm leading-6 text-(--color-subtle)">
            {copy.notifications.pmEmailHint}
          </p>
          {status === "success" ? (
            <p role="status" className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
              {copy.notifications.successMessage}
            </p>
          ) : null}
          {status === "error" ? (
            <p role="alert" className="mt-2 text-xs text-red-800 dark:text-red-300">
              {error ?? copy.notifications.errorFallback}
            </p>
          ) : null}
        </div>
      </div>
      <PushToggleRow />
    </section>
  );
}

function SessionsSection() {
  const copy = useLocalizedContent(settingsCopy);
  const { accessToken, logout } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<SectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke() {
    if (!accessToken) {
      return;
    }

    setStatus("pending");
    setError(null);

    try {
      await revokeAllSessions(accessToken);
      await logout();
      router.push("/login");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : copy.sessions.errorFallback,
      );
      setStatus("error");
    }
  }

  if (!accessToken) {
    return null;
  }

  return (
    <section className="site-card p-6 sm:p-7">
      <h2 className="text-xl font-semibold">{copy.sessions.title}</h2>
      <p className="site-muted mt-3 text-sm leading-7">{copy.sessions.body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={status === "pending"}
          onClick={handleRevoke}
          className="min-h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
        >
          {status === "pending"
            ? copy.sessions.revokingLabel
            : copy.sessions.revokeLabel}
        </button>
        {status === "error" ? (
          <p role="alert" className="text-sm text-red-800 dark:text-red-300">
            {error ?? copy.sessions.errorFallback}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function SettingsView() {
  const copy = useLocalizedContent(settingsCopy);
  const { status, user } = useAuth();

  return (
    <PageShell className="gap-8">
      <article className="site-panel p-8 sm:p-10">
        <p className="site-kicker">{copy.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 opacity-85">
          {copy.intro}
        </p>
      </article>

      {status === "checking" ? null : null}

      {status !== "checking" && !user ? (
        <section className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.notSignedIn.title}</p>
          <p className="site-muted mt-4 text-base leading-8">
            {copy.notSignedIn.body}
          </p>
          <div className="mt-7">
            <Link
              href="/login"
              className="min-h-12 rounded-xl border border-(--color-border) bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              {copy.notSignedIn.loginLabel}
            </Link>
          </div>
        </section>
      ) : null}

      {user ? (
        <>
          <ProfileSection />
          <PasswordSection />
          <NotificationsSection />
          <SessionsSection />
        </>
      ) : null}
    </PageShell>
  );
}
