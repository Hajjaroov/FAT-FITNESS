alter table forum_post_reports
	add column resolved_by_user_id uuid;

alter table forum_post_reports
	add column resolution_note varchar(1000);

alter table forum_post_reports
	add constraint fk_forum_post_reports_resolved_by
	foreign key (resolved_by_user_id) references users (id);

create index ix_forum_post_reports_resolved_by_user_id
	on forum_post_reports (resolved_by_user_id);

alter table forum_comment_reports
	add column resolved_by_user_id uuid;

alter table forum_comment_reports
	add column resolution_note varchar(1000);

alter table forum_comment_reports
	add constraint fk_forum_comment_reports_resolved_by
	foreign key (resolved_by_user_id) references users (id);

create index ix_forum_comment_reports_resolved_by_user_id
	on forum_comment_reports (resolved_by_user_id);
