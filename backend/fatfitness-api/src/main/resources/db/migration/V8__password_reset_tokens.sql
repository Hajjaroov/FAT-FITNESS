-- Migration: add password reset tokens for the forgot-password / reset-password flow.

create table password_reset_tokens (
  id         uuid primary key,
  user_id    uuid not null,
  token_hash varchar(128) not null,
  expires_at timestamp with time zone not null,
  used_at    timestamp with time zone,
  created_at timestamp with time zone not null,
  constraint uq_password_reset_tokens_hash unique (token_hash),
  constraint fk_password_reset_tokens_user foreign key (user_id) references users (id)
);

create index ix_password_reset_tokens_user on password_reset_tokens (user_id);
