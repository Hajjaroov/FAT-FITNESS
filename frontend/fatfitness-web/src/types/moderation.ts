export type ModerationReportTargetType = "POST" | "COMMENT";

export type ModerationReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type ModerationReportStatusFilter = ModerationReportStatus | "ALL";

export type ModerationReport = {
  id: string;
  targetType: ModerationReportTargetType;
  targetId: string;
  postId: string;
  targetTitle: string;
  targetPreview: string;
  contentAuthorUserId: string;
  contentAuthorDisplayName: string;
  reporterUserId: string;
  reporterDisplayName: string;
  reason: string;
  details: string | null;
  status: ModerationReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  resolvedByDisplayName: string | null;
  resolutionNote: string | null;
};

export type ResolveModerationReportRequest = {
  status: "RESOLVED" | "DISMISSED";
  resolutionNote?: string;
};
