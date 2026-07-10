CREATE TABLE exercises (
    id UUID NOT NULL,
    created_by_user_id UUID REFERENCES users(id),
    name VARCHAR(160) NOT NULL,
    name_de VARCHAR(220),
    photo_src VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_exercises PRIMARY KEY (id)
);

CREATE INDEX idx_exercises_name ON exercises (name);

CREATE TABLE workout_plan_days (
    id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(120) NOT NULL,
    -- Optional: a block can be pinned to a day of the week ("MONDAY" -> Upper A)
    -- or float free of one (a warm-up protocol that applies to every session).
    weekday VARCHAR(10),
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_workout_plan_days PRIMARY KEY (id),
    CONSTRAINT chk_workout_plan_days_weekday CHECK (
        weekday IS NULL
        OR weekday IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')
    )
);

CREATE INDEX idx_workout_plan_days_user_position ON workout_plan_days (user_id, position);

CREATE TABLE workout_plan_day_exercises (
    id UUID NOT NULL,
    plan_day_id UUID NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
    name VARCHAR(160) NOT NULL,
    -- Free text, same shape as the Journal training pages: "3 x 8-10",
    -- "2 minutes", "2 x 12-15 each side" - ranges, durations, and weights
    -- don't fit structured integer columns.
    sets VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_workout_plan_day_exercises PRIMARY KEY (id)
);

CREATE INDEX idx_workout_plan_day_exercises_day ON workout_plan_day_exercises (plan_day_id);
