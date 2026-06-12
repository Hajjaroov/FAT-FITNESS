create table forum_posts (
	id uuid primary key,
	category_id uuid not null,
	author_user_id uuid not null,
	title varchar(160) not null,
	body text not null,
	status varchar(40) not null,
	is_locked boolean not null default false,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	hidden_at timestamp with time zone,
	deleted_at timestamp with time zone,
	locked_at timestamp with time zone,
	constraint fk_forum_posts_category foreign key (category_id) references forum_categories (id),
	constraint fk_forum_posts_author foreign key (author_user_id) references users (id),
	constraint chk_forum_posts_status check (
		status in ('PUBLISHED', 'HIDDEN', 'DELETED')
	)
);

create index ix_forum_posts_category_status_created
	on forum_posts (category_id, status, created_at desc);
create index ix_forum_posts_author_user_id
	on forum_posts (author_user_id);
create index ix_forum_posts_status_created
	on forum_posts (status, created_at desc);

create table forum_post_reports (
	id uuid primary key,
	post_id uuid not null,
	reporter_user_id uuid not null,
	reason varchar(80) not null,
	details varchar(1000),
	status varchar(40) not null,
	created_at timestamp with time zone not null,
	resolved_at timestamp with time zone,
	constraint fk_forum_post_reports_post foreign key (post_id) references forum_posts (id),
	constraint fk_forum_post_reports_reporter foreign key (reporter_user_id) references users (id),
	constraint ux_forum_post_reports_post_reporter unique (post_id, reporter_user_id),
	constraint chk_forum_post_reports_status check (
		status in ('OPEN', 'RESOLVED', 'DISMISSED')
	)
);

create index ix_forum_post_reports_post_id
	on forum_post_reports (post_id);
create index ix_forum_post_reports_status_created
	on forum_post_reports (status, created_at);
