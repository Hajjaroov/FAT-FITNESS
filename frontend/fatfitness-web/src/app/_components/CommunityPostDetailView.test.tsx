import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityPostDetailView } from "@/app/_components/CommunityPostDetailView";
import { renderWithProviders } from "@/test/render";
import { getForumPost, likeForumPost, refreshAuthSession } from "@/lib/api";
import type { ForumPost } from "@/types/community";

vi.mock("@/lib/api");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/community/posts/p1",
}));

const post: ForumPost = {
  id: "p1",
  categorySlug: "journey-logs",
  categoryName: "Journey Logs",
  title: "Week 12 check-in",
  body: "Down another 1.5 kg this week.",
  authorId: "author-1",
  authorDisplayName: "Journey Logger",
  authorHasAvatar: false,
  status: "PUBLISHED",
  locked: false,
  createdAt: "2026-07-01T10:00:00Z",
  updatedAt: "2026-07-01T10:00:00Z",
  editedAt: null,
  likeCount: 5,
  likedByCurrentUser: false,
  bookmarkedByCurrentUser: false,
};

afterEach(() => {
  vi.resetAllMocks();
});

describe("CommunityPostDetailView", () => {
  it("waits for auth to settle and fetches exactly once, with the token", async () => {
    // Regression guard for the architecture invariant: never fire authenticated
    // fetches while auth status is still "checking" — a premature fetch would
    // read like/bookmark state as an anonymous visitor.
    vi.mocked(getForumPost).mockResolvedValue(post);

    renderWithProviders(<CommunityPostDetailView postId="p1" />);

    expect(await screen.findByText("Week 12 check-in")).toBeInTheDocument();
    expect(getForumPost).toHaveBeenCalledTimes(1);
    expect(getForumPost).toHaveBeenCalledWith("p1", "test-token");
  });

  it("fetches anonymously without a token when there is no session", async () => {
    vi.mocked(refreshAuthSession).mockRejectedValue(new Error("no session"));
    vi.mocked(getForumPost).mockResolvedValue({
      ...post,
      likedByCurrentUser: null,
      bookmarkedByCurrentUser: null,
    });

    renderWithProviders(<CommunityPostDetailView postId="p1" />);

    expect(await screen.findByText("Week 12 check-in")).toBeInTheDocument();
    expect(getForumPost).toHaveBeenCalledWith("p1", undefined);
    expect(screen.getByRole("button", { name: "Like" })).toBeDisabled();
  });

  it("toggles the like state from the server response", async () => {
    const user = userEvent.setup();
    vi.mocked(getForumPost).mockResolvedValue(post);
    vi.mocked(likeForumPost).mockResolvedValue({ liked: true, likeCount: 6 });

    renderWithProviders(<CommunityPostDetailView postId="p1" />);
    await screen.findByText("Week 12 check-in");

    await user.click(screen.getByRole("button", { name: "Like" }));

    expect(await screen.findByRole("button", { name: "Liked" })).toBeInTheDocument();
    expect(likeForumPost).toHaveBeenCalledWith("p1", "test-token");
  });
});
