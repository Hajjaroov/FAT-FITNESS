
-- Migration: add moderation actions audit table.
-- Note: `forum_posts` already contains `is_locked` and `locked_at` in earlier migrations.

create table moderation_actions (
  id uuid primary key,
  moderator_user_id uuid not null,
  target_type varchar(20) not null,
  target_id uuid not null,
  action varchar(40) not null,
  note varchar(1000),
  created_at timestamp with time zone not null,
  constraint fk_moderation_actions_moderator foreign key (moderator_user_id) references users (id)
);

create index ix_moderation_actions_moderator on moderation_actions (moderator_user_id);
create index ix_moderation_actions_target on moderation_actions (target_type, target_id);
