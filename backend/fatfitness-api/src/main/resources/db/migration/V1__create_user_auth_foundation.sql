create table users (
	id uuid primary key,
	email varchar(320) not null,
	display_name varchar(80) not null,
	country_region_code varchar(16) not null,
	password_hash varchar(255) not null,
	status varchar(40) not null,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	email_verified_at timestamp with time zone,
	last_login_at timestamp with time zone,
	deleted_at timestamp with time zone,
	constraint ux_users_email unique (email),
	constraint chk_users_status check (
		status in ('PENDING_EMAIL_VERIFICATION', 'ACTIVE', 'BANNED', 'DELETED')
	)
);

create table user_roles (
	user_id uuid not null,
	role varchar(40) not null,
	primary key (user_id, role),
	constraint fk_user_roles_user foreign key (user_id) references users (id) on delete cascade,
	constraint chk_user_roles_role check (
		role in ('OWNER', 'ADMIN', 'MODERATOR', 'USER')
	)
);

create table email_verification_tokens (
	id uuid primary key,
	user_id uuid not null,
	token_hash varchar(255) not null,
	expires_at timestamp with time zone not null,
	consumed_at timestamp with time zone,
	created_at timestamp with time zone not null,
	constraint ux_email_verification_tokens_token_hash unique (token_hash),
	constraint fk_email_verification_tokens_user foreign key (user_id) references users (id) on delete cascade
);

create table refresh_sessions (
	id uuid primary key,
	user_id uuid not null,
	refresh_token_hash varchar(255) not null,
	client_type varchar(32) not null,
	device_label varchar(120),
	user_agent varchar(512),
	ip_address varchar(45),
	expires_at timestamp with time zone not null,
	revoked_at timestamp with time zone,
	replaced_by_session_id uuid,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	last_used_at timestamp with time zone,
	constraint ux_refresh_sessions_token_hash unique (refresh_token_hash),
	constraint fk_refresh_sessions_user foreign key (user_id) references users (id) on delete cascade,
	constraint fk_refresh_sessions_replacement foreign key (replaced_by_session_id) references refresh_sessions (id),
	constraint chk_refresh_sessions_client_type check (
		client_type in ('WEB', 'MOBILE', 'DESKTOP', 'OTHER')
	)
);

create index ix_user_roles_user_id on user_roles (user_id);
create index ix_email_verification_tokens_user_id on email_verification_tokens (user_id);
create index ix_email_verification_tokens_expires_at on email_verification_tokens (expires_at);
create index ix_refresh_sessions_user_id on refresh_sessions (user_id);
create index ix_refresh_sessions_expires_at on refresh_sessions (expires_at);
create index ix_refresh_sessions_revoked_at on refresh_sessions (revoked_at);
