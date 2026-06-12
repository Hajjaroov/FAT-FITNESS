export type ForumPostStatus = "PUBLISHED" | "HIDDEN" | "DELETED";

export type ForumPost = {
  id: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  body: string;
  authorDisplayName: string;
  status: ForumPostStatus;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateForumPostRequest = {
  categorySlug: string;
  title: string;
  body: string;
  acceptedCommunityGuidelines: boolean;
};

export type ForumReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type ReportForumPostRequest = {
  reason: string;
  details?: string;
};

export type ForumPostReport = {
  id: string;
  postId: string;
  reason: string;
  details: string | null;
  status: ForumReportStatus;
  createdAt: string;
};
