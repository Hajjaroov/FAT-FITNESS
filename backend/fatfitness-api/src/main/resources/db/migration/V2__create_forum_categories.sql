create table forum_categories (
	id uuid primary key,
	slug varchar(120) not null,
	name varchar(120) not null,
	description varchar(500) not null,
	display_order integer not null,
	is_active boolean not null default true,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	constraint ux_forum_categories_slug unique (slug),
	constraint ux_forum_categories_display_order unique (display_order),
	constraint chk_forum_categories_display_order check (display_order >= 0)
);

create index ix_forum_categories_active_order
	on forum_categories (is_active, display_order);

insert into forum_categories (
	id,
	slug,
	name,
	description,
	display_order,
	is_active,
	created_at,
	updated_at
) values
	(
		'00000000-0000-0000-0000-000000000101',
		'introductions',
		'Introductions',
		'Who you are, where you are starting, and what kind of support helps.',
		10,
		true,
		current_timestamp,
		current_timestamp
	),
	(
		'00000000-0000-0000-0000-000000000102',
		'journey-logs',
		'Journey Logs',
		'Long-running progress threads with updates, setbacks, and small wins.',
		20,
		true,
		current_timestamp,
		current_timestamp
	),
	(
		'00000000-0000-0000-0000-000000000103',
		'food-and-diet',
		'Food & Diet',
		'Meal ideas, practical routines, shopping notes, and what did or did not work.',
		30,
		true,
		current_timestamp,
		current_timestamp
	),
	(
		'00000000-0000-0000-0000-000000000104',
		'training-at-high-bodyweight',
		'Training at High Bodyweight',
		'Beginner movement, gym anxiety, equipment, recovery, and realistic starting points.',
		40,
		true,
		current_timestamp,
		current_timestamp
	),
	(
		'00000000-0000-0000-0000-000000000105',
		'glp-1-experience',
		'GLP-1 Experience',
		'Personal experiences and questions to discuss with qualified professionals.',
		50,
		true,
		current_timestamp,
		current_timestamp
	),
	(
		'00000000-0000-0000-0000-000000000106',
		'questions-and-support',
		'Questions & Support',
		'Beginner questions where replies should be careful, kind, and non-prescriptive.',
		60,
		true,
		current_timestamp,
		current_timestamp
	),
	(
		'00000000-0000-0000-0000-000000000107',
		'progress-wins',
		'Progress Wins',
		'Scale and non-scale wins without turning progress into competition.',
		70,
		true,
		current_timestamp,
		current_timestamp
	),
	(
		'00000000-0000-0000-0000-000000000108',
		'equipment-and-tools',
		'Equipment & Tools',
		'Benches, dumbbells, tracking apps, food tools, and other practical product notes.',
		80,
		true,
		current_timestamp,
		current_timestamp
	);
