
-- Migration: add post/comment likes and post bookmarks.

create table post_likes (
  id uuid primary key,
  user_id uuid not null,
  post_id uuid not null,
  created_at timestamp with time zone not null,
  constraint fk_post_likes_user foreign key (user_id) references users (id),
  constraint fk_post_likes_post foreign key (post_id) references forum_posts (id),
  constraint uq_post_likes_user_post unique (user_id, post_id)
);

create table comment_likes (
  id uuid primary key,
  user_id uuid not null,
  comment_id uuid not null,
  created_at timestamp with time zone not null,
  constraint fk_comment_likes_user foreign key (user_id) references users (id),
  constraint fk_comment_likes_comment foreign key (comment_id) references forum_comments (id),
  constraint uq_comment_likes_user_comment unique (user_id, comment_id)
);

create table post_bookmarks (
  id uuid primary key,
  user_id uuid not null,
  post_id uuid not null,
  created_at timestamp with time zone not null,
  constraint fk_post_bookmarks_user foreign key (user_id) references users (id),
  constraint fk_post_bookmarks_post foreign key (post_id) references forum_posts (id),
  constraint uq_post_bookmarks_user_post unique (user_id, post_id)
);

create index ix_post_likes_post on post_likes (post_id);
create index ix_post_likes_user on post_likes (user_id);
create index ix_comment_likes_comment on comment_likes (comment_id);
create index ix_comment_likes_user on comment_likes (user_id);
create index ix_post_bookmarks_post on post_bookmarks (post_id);
create index ix_post_bookmarks_user on post_bookmarks (user_id);
