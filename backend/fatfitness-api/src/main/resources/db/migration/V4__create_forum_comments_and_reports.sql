create table forum_comments (
	id uuid primary key,
	post_id uuid not null,
	author_user_id uuid not null,
	body text not null,
	status varchar(40) not null,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	hidden_at timestamp with time zone,
	deleted_at timestamp with time zone,
	constraint fk_forum_comments_post foreign key (post_id) references forum_posts (id),
	constraint fk_forum_comments_author foreign key (author_user_id) references users (id),
	constraint chk_forum_comments_status check (
		status in ('PUBLISHED', 'HIDDEN', 'DELETED')
	)
);

create index ix_forum_comments_post_status_created
	on forum_comments (post_id, status, created_at);
create index ix_forum_comments_author_user_id
	on forum_comments (author_user_id);
create index ix_forum_comments_status_created
	on forum_comments (status, created_at);

create table forum_comment_reports (
	id uuid primary key,
	comment_id uuid not null,
	reporter_user_id uuid not null,
	reason varchar(80) not null,
	details varchar(1000),
	status varchar(40) not null,
	created_at timestamp with time zone not null,
	resolved_at timestamp with time zone,
	constraint fk_forum_comment_reports_comment foreign key (comment_id) references forum_comments (id),
	constraint fk_forum_comment_reports_reporter foreign key (reporter_user_id) references users (id),
	constraint ux_forum_comment_reports_comment_reporter unique (comment_id, reporter_user_id),
	constraint chk_forum_comment_reports_status check (
		status in ('OPEN', 'RESOLVED', 'DISMISSED')
	)
);

create index ix_forum_comment_reports_comment_id
	on forum_comment_reports (comment_id);
create index ix_forum_comment_reports_status_created
	on forum_comment_reports (status, created_at);
