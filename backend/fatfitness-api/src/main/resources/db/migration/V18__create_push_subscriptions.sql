create table push_subscriptions (
	id uuid primary key,
	user_id uuid not null,
	endpoint text not null unique,
	p256dh varchar(255) not null,
	auth varchar(255) not null,
	user_agent varchar(512),
	created_at timestamp with time zone not null,
	constraint fk_push_subscriptions_user foreign key (user_id) references users (id) on delete cascade
);

create index ix_push_subscriptions_user on push_subscriptions (user_id);
