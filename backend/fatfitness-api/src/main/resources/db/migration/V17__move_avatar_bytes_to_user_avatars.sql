-- Migration: move avatar image bytes out of users into a dedicated user_avatars table.
-- Why: users.avatar_jpeg was loaded eagerly with every UserAccount entity (every forum
-- post/comment author, message sender, inbox row), dragging the full JPEG into memory
-- just to answer hasAvatar(). The bytes now live in their own table, loaded only by the
-- avatar endpoint; users keeps a cheap has_avatar flag for response mapping.

create table user_avatars (
	user_id     uuid primary key,
	avatar_jpeg bytea not null,
	updated_at  timestamp with time zone not null,
	constraint fk_user_avatars_user foreign key (user_id) references users (id) on delete cascade
);

insert into user_avatars (user_id, avatar_jpeg, updated_at)
select id, avatar_jpeg, updated_at from users where avatar_jpeg is not null;

alter table users add column has_avatar boolean not null default false;

update users set has_avatar = true where avatar_jpeg is not null;

alter table users drop column avatar_jpeg;
