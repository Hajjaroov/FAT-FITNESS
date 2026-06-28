export type UserPublicProfile = {
  userId: string;
  displayName: string;
  countryRegionCode: string | null;
  hasAvatar: boolean;
  joinedAt: string;
  publicRoles: string[];
  threadCount: number;
  commentCount: number;
  likesReceived: number;
  recentThreads: PublicThreadSummary[];
  recentComments: PublicCommentSummary[];
};

export type PublicThreadSummary = {
  id: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  createdAt: string;
};

export type PublicCommentSummary = {
  commentId: string;
  excerpt: string;
  postId: string;
  postTitle: string;
  createdAt: string;
};
