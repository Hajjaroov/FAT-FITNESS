create table conversations (
	id uuid primary key,
	subject varchar(160) not null,
	created_at timestamp with time zone not null
);

create table conversation_participants (
	id uuid primary key,
	conversation_id uuid not null,
	user_id uuid not null,
	last_read_at timestamp with time zone,
	deleted boolean not null default false,
	constraint fk_conversation_participants_conversation foreign key (conversation_id) references conversations (id),
	constraint fk_conversation_participants_user foreign key (user_id) references users (id),
	constraint ux_conversation_participants_conversation_user unique (conversation_id, user_id)
);

create index ix_conversation_participants_user_deleted
	on conversation_participants (user_id, deleted);

create table messages (
	id uuid primary key,
	conversation_id uuid not null,
	sender_user_id uuid not null,
	body text not null,
	sent_at timestamp with time zone not null,
	constraint fk_messages_conversation foreign key (conversation_id) references conversations (id),
	constraint fk_messages_sender foreign key (sender_user_id) references users (id)
);

create index ix_messages_conversation_sent
	on messages (conversation_id, sent_at);
