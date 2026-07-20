"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { PageShell } from "@/app/_components/PageShell";
import { adminCopy } from "@/content/admin";
import { ApiError, deleteFood, getMacroChecks, resolveMacroCheck } from "@/lib/api";
import { formatTimestampWithTime } from "@/lib/date";
import type { UserRole } from "@/types/auth";
import type { FoodMacroCheck, FoodMacroCheckStatus } from "@/types/diet";

type LoadState = "idle" | "loading" | "success" | "error";
type StatusFilter = FoodMacroCheckStatus | "ALL";

const moderationRoles = new Set<UserRole>(["OWNER", "ADMIN", "MODERATOR"]);
const statusFilters: StatusFilter[] = ["OPEN", "RESOLVED", "DISMISSED", "ALL"];

function hasModeratorAccess(roles: UserRole[]) {
  return roles.some((role) => moderationRoles.has(role));
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export function AdminMacroChecksView() {
  const copy = useLocalizedContent(adminCopy);
  const { status: authStatus, user, accessToken } = useAuth();
  const [checks, setChecks] = useState<FoodMacroCheck[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("OPEN");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const canModerate = user ? hasModeratorAccess(user.roles) : false;

  async function refresh() {
    if (!accessToken || !canModerate) return;
    setIsRefreshing(true);
    setLoadState("loading");
    setLoadError(null);
    try {
      const next = await getMacroChecks(statusFilter, accessToken);
      setChecks(next);
      setLoadState("success");
    } catch (caughtError) {
      setLoadError(errorMessage(caughtError, copy.macroChecks.errorFallback));
      setLoadState("error");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function load() {
      if (!accessToken || !canModerate) return;
      setLoadState("loading");
      setLoadError(null);
      try {
        const next = await getMacroChecks(statusFilter, accessToken);
        if (!isActive) return;
        setChecks(next);
        setLoadState("success");
      } catch (caughtError) {
        if (!isActive) return;
        setLoadError(errorMessage(caughtError, copy.macroChecks.errorFallback));
        setLoadState("error");
      }
    }

    if (authStatus === "authenticated" && canModerate) {
      load();
    }

    return () => {
      isActive = false;
    };
  }, [accessToken, authStatus, canModerate, copy.macroChecks.errorFallback, statusFilter]);

  return (
    <PageShell className="gap-8">
      <section className="site-panel p-8 sm:p-10">
        <p className="site-kicker">{copy.macroChecks.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {copy.macroChecks.title}
        </h1>
        <Link href="/admin" className="site-text-link mt-4 inline-block text-sm">
          {copy.macroChecks.backToReportsLabel}
        </Link>
      </section>

      {authStatus === "checking" ? (
        <section className="site-card p-8 sm:p-10" aria-live="polite">
          <p className="site-kicker">{copy.loading.title}</p>
        </section>
      ) : null}

      {authStatus !== "checking" && !user ? (
        <section className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.signedOut.title}</p>
          <p className="site-muted mt-4 max-w-2xl text-base leading-8">{copy.signedOut.body}</p>
        </section>
      ) : null}

      {user && !canModerate ? (
        <section className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.noAccess.title}</p>
          <p className="site-muted mt-4 max-w-2xl text-base leading-8">{copy.noAccess.body}</p>
        </section>
      ) : null}

      {user && canModerate ? (
        <>
          <section className="site-card p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <label htmlFor="macro-check-status" className="text-sm font-semibold">
                  {copy.macroChecks.statusLabel}
                </label>
                <select
                  id="macro-check-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.currentTarget.value as StatusFilter)}
                  className="mt-2 min-h-12 w-48 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition focus:border-(--color-accent)"
                >
                  {statusFilters.map((s) => (
                    <option key={s} value={s}>
                      {copy.macroChecks.statuses[s]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={isRefreshing}
                onClick={() => void refresh()}
                className="min-h-12 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {isRefreshing ? copy.macroChecks.refreshPendingLabel : copy.macroChecks.refreshLabel}
              </button>
            </div>
          </section>

          {loadState === "loading" ? (
            <section className="site-card p-8 text-center sm:p-12">
              <p className="site-muted text-sm font-semibold">{copy.macroChecks.loading}</p>
            </section>
          ) : null}

          {loadState === "error" ? (
            <section className="site-card p-8 text-center sm:p-12">
              <h2 className="text-2xl font-semibold">{copy.macroChecks.errorTitle}</h2>
              <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">{loadError}</p>
            </section>
          ) : null}

          {loadState === "success" && checks.length === 0 ? (
            <section className="site-card p-8 text-center sm:p-12">
              <h2 className="text-2xl font-semibold">{copy.macroChecks.emptyTitle}</h2>
              <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
                {copy.macroChecks.emptyText}
              </p>
            </section>
          ) : null}

          {loadState === "success" && checks.length > 0 ? (
            <section className="grid gap-6">
              {checks.map((check) => (
                <MacroCheckCard
                  key={check.id}
                  check={check}
                  onResolved={(updated) => {
                    setChecks((prev) =>
                      prev
                        .map((c) => (c.id === updated.id ? updated : c))
                        .filter((c) => statusFilter === "ALL" || c.status === statusFilter),
                    );
                  }}
                  onFoodDeleted={(deletedFoodId) => {
                    // Deleting the food cascades to delete every macro check
                    // referencing it (including this one and any other pending
                    // flags on the same food), so drop them all locally too.
                    setChecks((prev) => prev.filter((c) => c.targetFood.id !== deletedFoodId));
                  }}
                />
              ))}
            </section>
          ) : null}
        </>
      ) : null}
    </PageShell>
  );
}

function MacroCheckCard({
  check,
  onResolved,
  onFoodDeleted,
}: {
  check: FoodMacroCheck;
  onResolved: (check: FoodMacroCheck) => void;
  onFoodDeleted: (foodId: string) => void;
}) {
  const copy = useLocalizedContent(adminCopy);
  const { accessToken } = useAuth();
  const [finalName, setFinalName] = useState(check.proposedName ?? check.targetFood.name);
  const [finalNameDe, setFinalNameDe] = useState(check.targetFood.nameDe ?? "");
  const [finalUnitLabel, setFinalUnitLabel] = useState(
    check.proposedUnitLabel ?? check.targetFood.unitLabel,
  );
  const [finalCalories, setFinalCalories] = useState(String(check.proposedCaloriesPerUnit));
  const [finalProtein, setFinalProtein] = useState(String(check.proposedProteinPerUnit));
  const [finalCarbs, setFinalCarbs] = useState(String(check.proposedCarbsPerUnit));
  const [finalFat, setFinalFat] = useState(String(check.proposedFatPerUnit));
  const [resolutionNote, setResolutionNote] = useState("");
  const [pendingAction, setPendingAction] = useState<"APPLY" | "DISMISS" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${check.targetFood.name} nutrition facts`)}`;

  if (check.status !== "OPEN") {
    return (
      <article className="site-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">{check.targetFood.name}</h2>
        <p className="site-muted mt-2 text-sm">{copy.macroChecks.closedBody}</p>
      </article>
    );
  }

  async function handleResolve(action: "APPLY" | "DISMISS") {
    if (!accessToken) return;
    setPendingAction(action);
    setError(null);
    setSuccess(null);
    try {
      const updated = await resolveMacroCheck(
        check.id,
        {
          action,
          finalName: action === "APPLY" ? finalName.trim() : undefined,
          finalNameDe: action === "APPLY" ? finalNameDe.trim() || undefined : undefined,
          finalUnitLabel: action === "APPLY" ? finalUnitLabel.trim() : undefined,
          finalCaloriesPerUnit: action === "APPLY" ? parseFloat(finalCalories) : undefined,
          finalProteinPerUnit: action === "APPLY" ? parseFloat(finalProtein) : undefined,
          finalCarbsPerUnit: action === "APPLY" ? parseFloat(finalCarbs) : undefined,
          finalFatPerUnit: action === "APPLY" ? parseFloat(finalFat) : undefined,
          resolutionNote: resolutionNote.trim() || undefined,
        },
        accessToken,
      );
      onResolved(updated);
      setSuccess(action === "APPLY" ? copy.macroChecks.successApplied : copy.macroChecks.successDismissed);
    } catch (caughtError) {
      setError(errorMessage(caughtError, copy.macroChecks.errorFallback));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteFood() {
    if (!accessToken) return;
    if (!window.confirm(copy.macroChecks.deleteFoodConfirm)) return;
    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteFood(check.targetFood.id, accessToken);
      onFoodDeleted(check.targetFood.id);
    } catch (caughtError) {
      setError(errorMessage(caughtError, copy.macroChecks.deleteErrorFallback));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className="site-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{check.targetFood.name}</h2>
          <p className="site-muted mt-1 text-xs">
            {copy.macroChecks.submittedByLabel}: {check.submittedByDisplayName} ·{" "}
            {copy.macroChecks.createdLabel}: {formatTimestampWithTime(check.createdAt)}
          </p>
        </div>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-semibold transition hover:border-(--color-border-strong)"
        >
          {copy.macroChecks.lookUpLabel}
        </a>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
          <p className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">
            {copy.macroChecks.currentValuesLabel}
          </p>
          <p className="mt-2 text-sm leading-6">
            {check.targetFood.name} ({check.targetFood.unitLabel})<br />
            {check.targetFood.caloriesPerUnit} kcal | {check.targetFood.proteinPerUnit}g P |{" "}
            {check.targetFood.carbsPerUnit}g C | {check.targetFood.fatPerUnit}g F
          </p>
        </div>
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
          <p className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">
            {copy.macroChecks.proposedValuesLabel}
          </p>
          <p className="mt-2 text-sm leading-6">
            {check.proposedName ?? check.targetFood.name} ({check.proposedUnitLabel ?? check.targetFood.unitLabel})
            <br />
            {check.proposedCaloriesPerUnit} kcal | {check.proposedProteinPerUnit}g P |{" "}
            {check.proposedCarbsPerUnit}g C | {check.proposedFatPerUnit}g F
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
        <p className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">
          {copy.macroChecks.commentLabel}
        </p>
        <p className="site-muted mt-2 text-sm leading-6">{check.comment || copy.macroChecks.noComment}</p>
      </div>

      <div className="mt-5 rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
        <p className="site-kicker">{copy.macroChecks.finalValuesLabel}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={finalName}
            onChange={(e) => setFinalName(e.target.value)}
            placeholder={copy.macroChecks.nameLabel}
            className="min-h-10 rounded-xl border border-(--color-border) bg-background px-3 text-sm text-foreground outline-none focus:border-(--color-accent) sm:col-span-2"
          />
          <input
            value={finalNameDe}
            onChange={(e) => setFinalNameDe(e.target.value)}
            placeholder={copy.macroChecks.nameDeLabel}
            className="min-h-10 rounded-xl border border-(--color-border) bg-background px-3 text-sm text-foreground outline-none focus:border-(--color-accent) sm:col-span-2"
          />
          <input
            value={finalUnitLabel}
            onChange={(e) => setFinalUnitLabel(e.target.value)}
            placeholder={copy.macroChecks.unitLabelLabel}
            className="min-h-10 rounded-xl border border-(--color-border) bg-background px-3 text-sm text-foreground outline-none focus:border-(--color-accent) sm:col-span-2"
          />
          <input
            type="number"
            step="0.1"
            value={finalCalories}
            onChange={(e) => setFinalCalories(e.target.value)}
            placeholder={copy.macroChecks.caloriesLabel}
            className="min-h-10 rounded-xl border border-(--color-border) bg-background px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
          <input
            type="number"
            step="0.1"
            value={finalProtein}
            onChange={(e) => setFinalProtein(e.target.value)}
            placeholder={copy.macroChecks.proteinLabel}
            className="min-h-10 rounded-xl border border-(--color-border) bg-background px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
          <input
            type="number"
            step="0.1"
            value={finalCarbs}
            onChange={(e) => setFinalCarbs(e.target.value)}
            placeholder={copy.macroChecks.carbsLabel}
            className="min-h-10 rounded-xl border border-(--color-border) bg-background px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
          <input
            type="number"
            step="0.1"
            value={finalFat}
            onChange={(e) => setFinalFat(e.target.value)}
            placeholder={copy.macroChecks.fatLabel}
            className="min-h-10 rounded-xl border border-(--color-border) bg-background px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>

        <label htmlFor={`note-${check.id}`} className="mt-4 block text-sm font-semibold">
          {copy.macroChecks.resolutionNoteLabel}
        </label>
        <textarea
          id={`note-${check.id}`}
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          rows={3}
          maxLength={1000}
          className="mt-2 w-full rounded-xl border border-(--color-border) bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
        />

        {error ? <p className="mt-3 text-sm text-red-800 dark:text-red-300">{error}</p> : null}
        {success ? (
          <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">{success}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pendingAction !== null}
            onClick={() => void handleResolve("APPLY")}
            className="min-h-11 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {pendingAction === "APPLY" ? copy.macroChecks.submitPendingLabel : copy.macroChecks.applyLabel}
          </button>
          <button
            type="button"
            disabled={pendingAction !== null}
            onClick={() => void handleResolve("DISMISS")}
            className="min-h-11 rounded-xl border border-(--color-border) bg-background px-5 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong) disabled:cursor-wait disabled:opacity-60"
          >
            {pendingAction === "DISMISS" ? copy.macroChecks.submitPendingLabel : copy.macroChecks.dismissLabel}
          </button>
          <button
            type="button"
            disabled={pendingAction !== null || isDeleting}
            onClick={() => void handleDeleteFood()}
            className="min-h-11 rounded-xl border border-red-500/30 bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isDeleting ? copy.macroChecks.submitPendingLabel : copy.macroChecks.deleteFoodLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
