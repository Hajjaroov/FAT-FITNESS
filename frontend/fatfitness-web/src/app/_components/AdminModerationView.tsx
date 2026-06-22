"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/app/_components/AuthProvider";
import {
  useLocale,
  useLocalizedContent,
} from "@/app/_components/LocaleProvider";
import { PageShell } from "@/app/_components/PageShell";
import { adminCopy } from "@/content/admin";
import {
  ApiError,
  getModerationReports,
  hideModerationCommentReport,
  hideModerationPostReport,
  resolveModerationCommentReport,
  resolveModerationPostReport,
  lockModerationPost,
  banUser,
} from "@/lib/api";
import type { UserRole } from "@/types/auth";
import type {
  ModerationReport,
  ModerationReportStatus,
  ModerationReportStatusFilter,
  ModerationReportTargetType,
} from "@/types/moderation";

type LoadState = "idle" | "loading" | "success" | "error";
type TargetTypeFilter = ModerationReportTargetType | "ALL";

const moderationRoles = new Set<UserRole>(["OWNER", "ADMIN", "MODERATOR"]);
const statusFilters: ModerationReportStatusFilter[] = [
  "OPEN",
  "RESOLVED",
  "DISMISSED",
  "ALL",
];
const targetTypeFilters: TargetTypeFilter[] = ["ALL", "POST", "COMMENT"];

function hasModeratorAccess(roles: UserRole[]) {
  return roles.some((role) => moderationRoles.has(role));
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function formatDateTime(value: string | null, locale: string, fallback = "-") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function reportStatusClass(status: ModerationReportStatus) {
  if (status === "OPEN") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-100";
  }

  if (status === "RESOLVED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100";
  }

  return "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-200";
}

function reportReasonLabel(reason: string) {
  return reason
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AdminModerationView() {
  const copy = useLocalizedContent(adminCopy);
  const { locale } = useLocale();
  const { status: authStatus, user, accessToken } = useAuth();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<ModerationReportStatusFilter>("OPEN");
  const [targetTypeFilter, setTargetTypeFilter] =
    useState<TargetTypeFilter>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const canModerate = user ? hasModeratorAccess(user.roles) : false;

  async function refreshReports() {
    if (!accessToken || !canModerate) {
      return;
    }

    setIsRefreshing(true);
    setLoadState("loading");
    setLoadError(null);

    try {
      const nextReports = await getModerationReports(
        {
          status: statusFilter,
          targetType: targetTypeFilter,
          limit: 100,
        },
        accessToken,
      );

      setReports(nextReports);
      setLoadState("success");
    } catch (caughtError) {
      setLoadError(errorMessage(caughtError, copy.actions.errorFallback));
      setLoadState("error");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      if (!accessToken || !canModerate) {
        return;
      }

      setLoadState("loading");
      setLoadError(null);

      try {
        const nextReports = await getModerationReports(
          {
            status: statusFilter,
            targetType: targetTypeFilter,
            limit: 100,
          },
          accessToken,
        );

        if (!isActive) {
          return;
        }

        setReports(nextReports);
        setLoadState("success");
      } catch (caughtError) {
        if (!isActive) {
          return;
        }

        setLoadError(errorMessage(caughtError, copy.actions.errorFallback));
        setLoadState("error");
      }
    }

    if (authStatus === "authenticated" && canModerate) {
      loadReports();
    }

    return () => {
      isActive = false;
    };
  }, [
    accessToken,
    authStatus,
    canModerate,
    copy.actions.errorFallback,
    statusFilter,
    targetTypeFilter,
  ]);

  return (
    <PageShell className="gap-8">
      <section className="site-panel p-8 sm:p-10">
        <p className="site-kicker">{copy.eyebrow}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 opacity-85">
              {copy.intro}
            </p>
          </div>

          {user ? (
            <dl className="rounded-3xl border border-white/20 bg-white/10 p-5 text-sm backdrop-blur">
              <div>
                <dt className="opacity-70">{copy.filters.statusLabel}</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {copy.filters.statuses[statusFilter]}
                </dd>
              </div>
              <div className="mt-4">
                <dt className="opacity-70">{copy.filters.targetTypeLabel}</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {copy.filters.targetTypes[targetTypeFilter]}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      {authStatus === "checking" ? (
        <section className="site-card p-8 sm:p-10" aria-live="polite">
          <p className="site-kicker">{copy.loading.title}</p>
          <p className="site-muted mt-4 text-base leading-8">
            {copy.loading.body}
          </p>
        </section>
      ) : null}

      {authStatus !== "checking" && !user ? (
        <section className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.signedOut.title}</p>
          <p className="site-muted mt-4 max-w-2xl text-base leading-8">
            {copy.signedOut.body}
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex min-h-12 items-center rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {copy.signedOut.loginLabel}
          </Link>
        </section>
      ) : null}

      {user && !canModerate ? (
        <section className="site-card p-8 sm:p-10">
          <p className="site-kicker">{copy.noAccess.title}</p>
          <p className="site-muted mt-4 max-w-2xl text-base leading-8">
            {copy.noAccess.body}
          </p>
        </section>
      ) : null}

      {user && canModerate ? (
        <>
          <section className="site-card p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="site-kicker">{copy.filters.title}</p>
                <p className="site-muted mt-3 text-sm leading-7">
                  {reports.length} {copy.title.toLowerCase()}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[12rem_12rem_auto] sm:items-end">
                <div>
                  <label
                    htmlFor="admin-report-status"
                    className="text-sm font-semibold"
                  >
                    {copy.filters.statusLabel}
                  </label>
                  <select
                    id="admin-report-status"
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(
                        event.currentTarget
                          .value as ModerationReportStatusFilter,
                      );
                    }}
                    className="mt-2 min-h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition focus:border-(--color-accent)"
                  >
                    {statusFilters.map((status) => (
                      <option key={status} value={status}>
                        {copy.filters.statuses[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-report-target-type"
                    className="text-sm font-semibold"
                  >
                    {copy.filters.targetTypeLabel}
                  </label>
                  <select
                    id="admin-report-target-type"
                    value={targetTypeFilter}
                    onChange={(event) => {
                      setTargetTypeFilter(
                        event.currentTarget.value as TargetTypeFilter,
                      );
                    }}
                    className="mt-2 min-h-12 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 text-base text-foreground outline-none transition focus:border-(--color-accent)"
                  >
                    {targetTypeFilters.map((targetType) => (
                      <option key={targetType} value={targetType}>
                        {copy.filters.targetTypes[targetType]}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={isRefreshing}
                  onClick={() => {
                    void refreshReports();
                  }}
                  className="min-h-12 rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                >
                  {isRefreshing
                    ? copy.filters.refreshPendingLabel
                    : copy.filters.refreshLabel}
                </button>
              </div>
            </div>
          </section>

          <ModerationReportList
            reports={reports}
            status={loadState}
            error={loadError}
            locale={locale}
            onResolved={(updatedReport) => {
              setReports((currentReports) =>
                currentReports.map((report) =>
                  report.id === updatedReport.id ? updatedReport : report,
                ).filter(
                  (report) =>
                    statusFilter === "ALL" || report.status === statusFilter,
                ),
              );
            }}
          />
        </>
      ) : null}
    </PageShell>
  );
}

function ModerationReportList({
  reports,
  status,
  error,
  locale,
  onResolved,
}: {
  reports: ModerationReport[];
  status: LoadState;
  error: string | null;
  locale: string;
  onResolved: (report: ModerationReport) => void;
}) {
  const copy = useLocalizedContent(adminCopy);

  if (status === "loading") {
    return (
      <section className="site-card p-8 text-center sm:p-12" aria-live="polite">
        <p className="site-muted text-sm font-semibold">{copy.list.loading}</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="site-card p-8 text-center sm:p-12">
        <h2 className="text-2xl font-semibold">{copy.list.errorTitle}</h2>
        <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
          {error ?? copy.actions.errorFallback}
        </p>
      </section>
    );
  }

  if (status === "success" && reports.length === 0) {
    return (
      <section className="site-card p-8 text-center sm:p-12">
        <h2 className="text-2xl font-semibold">{copy.list.emptyTitle}</h2>
        <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-7">
          {copy.list.emptyText}
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      {reports.map((report) => (
        <ModerationReportCard
          key={`${report.targetType}-${report.id}`}
          report={report}
          locale={locale}
          onResolved={onResolved}
        />
      ))}
    </section>
  );
}

function ModerationReportCard({
  report,
  locale,
  onResolved,
}: {
  report: ModerationReport;
  locale: string;
  onResolved: (report: ModerationReport) => void;
}) {
  const copy = useLocalizedContent(adminCopy);

  return (
    <article className="site-card overflow-hidden">
      <div className="site-divider border-b p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="site-kicker">
                {copy.targetTypes[report.targetType]}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${reportStatusClass(report.status)}`}
              >
                {copy.statusBadges[report.status]}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold">
              {report.targetTitle}
            </h2>
          </div>

          <Link
            href={`/community/posts/${report.postId}`}
            className="min-h-11 rounded-full border border-(--color-border) bg-(--color-surface) px-5 py-3 text-sm font-semibold transition hover:border-(--color-border-strong)"
          >
            {copy.list.openThreadLabel}
          </Link>
        </div>

        <p className="site-muted mt-4 whitespace-pre-wrap text-base leading-8">
          {report.targetPreview}
        </p>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <dl className="grid gap-4 md:grid-cols-2">
            <ReportMetaItem label={copy.list.targetLabel}>
              {copy.targetTypes[report.targetType]}
            </ReportMetaItem>
            <ReportMetaItem label={copy.list.createdLabel}>
              {formatDateTime(report.createdAt, locale)}
            </ReportMetaItem>
            <ReportMetaItem label={copy.list.authorLabel}>
              {report.contentAuthorDisplayName}
            </ReportMetaItem>
            <ReportMetaItem label={copy.list.reportedByLabel}>
              {report.reporterDisplayName}
            </ReportMetaItem>
            <ReportMetaItem label={copy.list.reasonLabel}>
              {reportReasonLabel(report.reason)}
            </ReportMetaItem>
            <ReportMetaItem label={copy.list.resolvedLabel}>
              {report.resolvedByDisplayName
                ? `${report.resolvedByDisplayName} / ${formatDateTime(
                    report.resolvedAt,
                    locale,
                  )}`
                : "-"}
            </ReportMetaItem>
          </dl>

          <div className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
            <p className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">
              {copy.list.detailsLabel}
            </p>
            <p className="site-muted mt-3 whitespace-pre-wrap text-sm leading-7">
              {report.details || copy.list.noDetails}
            </p>
          </div>

          {report.resolutionNote ? (
            <div className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
              <p className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">
                {copy.actions.noteLabel}
              </p>
              <p className="site-muted mt-3 whitespace-pre-wrap text-sm leading-7">
                {report.resolutionNote}
              </p>
            </div>
          ) : null}
        </div>

        <ModerationResolutionForm report={report} onResolved={onResolved} />
      </div>
    </article>
  );
}

function ReportMetaItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-4">
      <dt className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold leading-6">{children}</dd>
    </div>
  );
}

function ModerationResolutionForm({
  report,
  onResolved,
}: {
  report: ModerationReport;
  onResolved: (report: ModerationReport) => void;
}) {
  const copy = useLocalizedContent(adminCopy);
  const { accessToken } = useAuth();
  const [resolutionNote, setResolutionNote] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "HIDDEN" | "RESOLVED" | "DISMISSED" | "LOCKED" | "BANNED" | null
  >(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const noteId = `moderation-note-${report.targetType}-${report.id}`;

  if (report.status !== "OPEN") {
    return (
      <aside className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
        <p className="site-kicker">{copy.actions.closedTitle}</p>
        <p className="site-muted mt-4 text-sm leading-7">
          {copy.actions.closedBody}
        </p>
      </aside>
    );
  }

  async function handleResolve(nextStatus: "RESOLVED" | "DISMISSED") {
    if (!accessToken) {
      setFormError(copy.actions.errorFallback);
      return;
    }

    setPendingAction(nextStatus);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const request = {
        status: nextStatus,
        resolutionNote: resolutionNote.trim() || undefined,
      };
      const updatedReport =
        report.targetType === "POST"
          ? await resolveModerationPostReport(report.id, request, accessToken)
          : await resolveModerationCommentReport(report.id, request, accessToken);

      onResolved(updatedReport);
      setSuccessMessage(
        nextStatus === "RESOLVED"
          ? copy.actions.successResolved
          : copy.actions.successDismissed,
      );
    } catch (caughtError) {
      setFormError(errorMessage(caughtError, copy.actions.errorFallback));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleHide() {
    if (!accessToken) {
      setFormError(copy.actions.errorFallback);
      return;
    }

    setPendingAction("HIDDEN");
    setFormError(null);
    setSuccessMessage(null);

    try {
      const request = {
        resolutionNote: resolutionNote.trim() || undefined,
      };
      const updatedReport =
        report.targetType === "POST"
          ? await hideModerationPostReport(report.id, request, accessToken)
          : await hideModerationCommentReport(report.id, request, accessToken);

      onResolved(updatedReport);
      setSuccessMessage(copy.actions.successHidden);
    } catch (caughtError) {
      setFormError(errorMessage(caughtError, copy.actions.errorFallback));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleLock() {
    if (!accessToken) {
      setFormError(copy.actions.errorFallback);
      return;
    }

    setPendingAction("LOCKED");
    setFormError(null);
    setSuccessMessage(null);

    try {
      await lockModerationPost(report.postId, accessToken);
      setSuccessMessage(copy.actions.successLocked);
    } catch (caughtError) {
      setFormError(errorMessage(caughtError, copy.actions.errorFallback));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleBan() {
    if (!accessToken) {
      setFormError(copy.actions.errorFallback);
      return;
    }

    setPendingAction("BANNED");
    setFormError(null);
    setSuccessMessage(null);

    try {
      await banUser(report.contentAuthorUserId, accessToken);
      setSuccessMessage(copy.actions.successBanned);
    } catch (caughtError) {
      setFormError(errorMessage(caughtError, copy.actions.errorFallback));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <form className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5">
      <p className="site-kicker">{copy.actions.title}</p>

      <label
        htmlFor={noteId}
        className="mt-5 block text-sm font-semibold text-foreground"
      >
        {copy.actions.noteLabel}
      </label>
      <textarea
        id={noteId}
        value={resolutionNote}
        maxLength={1000}
        rows={5}
        onChange={(event) => {
          setResolutionNote(event.currentTarget.value);
        }}
        placeholder={copy.actions.notePlaceholder}
        className="mt-2 w-full rounded-2xl border border-(--color-border) bg-background px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-(--color-subtle) focus:border-(--color-accent)"
      />

      {formError ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-700 dark:text-red-200"
        >
          {formError}
        </p>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-800 dark:text-emerald-200"
        >
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          disabled={pendingAction !== null}
          onClick={() => {
            void handleHide();
          }}
          className="min-h-12 rounded-full border border-red-500/30 bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
        >
          {pendingAction === "HIDDEN"
            ? copy.actions.submitPendingLabel
            : copy.actions.hideLabel}
        </button>
        <button
          type="button"
          disabled={pendingAction !== null}
          onClick={() => {
            void handleResolve("RESOLVED");
          }}
          className="min-h-12 rounded-full border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {pendingAction === "RESOLVED"
            ? copy.actions.submitPendingLabel
            : copy.actions.resolveLabel}
        </button>
        <button
          type="button"
          disabled={pendingAction !== null}
          onClick={() => {
            void handleResolve("DISMISSED");
          }}
          className="min-h-12 rounded-full border border-(--color-border) bg-background px-5 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong) disabled:cursor-wait disabled:opacity-60"
        >
          {pendingAction === "DISMISSED"
            ? copy.actions.submitPendingLabel
            : copy.actions.dismissLabel}
        </button>
        {report.targetType === "POST" && (
          <button
            type="button"
            disabled={pendingAction !== null}
            onClick={() => {
              void handleLock();
            }}
            className="min-h-12 rounded-full border border-yellow-500/30 bg-yellow-600 px-5 text-sm font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-wait disabled:opacity-60"
          >
            {pendingAction === "LOCKED"
              ? copy.actions.submitPendingLabel
              : copy.actions.lockLabel}
          </button>
        )}
        <button
          type="button"
          disabled={pendingAction !== null}
          onClick={() => {
            void handleBan();
          }}
          className="min-h-12 rounded-full border border-red-600/30 bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
        >
          {pendingAction === "BANNED"
            ? copy.actions.submitPendingLabel
            : copy.actions.banLabel}
        </button>
      </div>
    </form>
  );
}
