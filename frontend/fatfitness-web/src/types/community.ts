export type ForumPostStatus = "PUBLISHED" | "HIDDEN" | "DELETED";
export type ForumCommentStatus = "PUBLISHED" | "HIDDEN" | "DELETED";

export type ForumPost = {
  id: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  body: string;
  authorId: string;
  authorDisplayName: string;
  authorHasAvatar: boolean;
  status: ForumPostStatus;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  likeCount: number;
  likedByCurrentUser: boolean | null;
  bookmarkedByCurrentUser: boolean | null;
};

export type LikeToggleResponse = {
  liked: boolean;
  likeCount: number;
};

export type BookmarkToggleResponse = {
  bookmarked: boolean;
};

export type CreateForumPostRequest = {
  categorySlug: string;
  title: string;
  body: string;
  acceptedCommunityGuidelines: boolean;
};

export type UpdateForumPostRequest = {
  title?: string;
  body?: string;
};

export type UpdateForumCommentRequest = {
  body: string;
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

export type ForumComment = {
  id: string;
  postId: string;
  body: string;
  authorId: string;
  authorDisplayName: string;
  authorHasAvatar: boolean;
  status: ForumCommentStatus;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  likeCount: number;
  likedByCurrentUser: boolean | null;
};

export type CreateForumCommentRequest = {
  body: string;
  acceptedCommunityGuidelines: boolean;
};

export type ReportForumCommentRequest = {
  reason: string;
  details?: string;
};

export type ForumCommentReport = {
  id: string;
  commentId: string;
  reason: string;
  details: string | null;
  status: ForumReportStatus;
  createdAt: string;
};
