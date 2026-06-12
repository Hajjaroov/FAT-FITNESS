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
