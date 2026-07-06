CREATE TABLE foods (
    id UUID NOT NULL,
    created_by_user_id UUID REFERENCES users(id),
    name VARCHAR(160) NOT NULL,
    name_de VARCHAR(220),
    unit_label VARCHAR(60) NOT NULL,
    calories_per_unit DECIMAL(7, 2) NOT NULL,
    protein_per_unit DECIMAL(6, 2) NOT NULL,
    carbs_per_unit DECIMAL(6, 2) NOT NULL,
    fat_per_unit DECIMAL(6, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_foods PRIMARY KEY (id)
);

CREATE INDEX idx_foods_name ON foods (name);

CREATE TABLE diet_meals (
    id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(120) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_diet_meals PRIMARY KEY (id)
);

CREATE INDEX idx_diet_meals_user_position ON diet_meals (user_id, position);

CREATE TABLE diet_meal_items (
    id UUID NOT NULL,
    meal_id UUID NOT NULL REFERENCES diet_meals(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    unit_label VARCHAR(60),
    quantity DECIMAL(6, 2) NOT NULL,
    calories_per_unit DECIMAL(7, 2) NOT NULL,
    protein_per_unit DECIMAL(6, 2) NOT NULL,
    carbs_per_unit DECIMAL(6, 2) NOT NULL,
    fat_per_unit DECIMAL(6, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_diet_meal_items PRIMARY KEY (id)
);

CREATE INDEX idx_diet_meal_items_meal ON diet_meal_items (meal_id);

CREATE TABLE food_macro_checks (
    id UUID NOT NULL,
    target_food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    submitted_by_user_id UUID NOT NULL REFERENCES users(id),
    proposed_name VARCHAR(120),
    proposed_unit_label VARCHAR(60),
    proposed_calories_per_unit DECIMAL(7, 2) NOT NULL,
    proposed_protein_per_unit DECIMAL(6, 2) NOT NULL,
    proposed_carbs_per_unit DECIMAL(6, 2) NOT NULL,
    proposed_fat_per_unit DECIMAL(6, 2) NOT NULL,
    comment VARCHAR(1000),
    status VARCHAR(40) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by_user_id UUID REFERENCES users(id),
    resolution_note VARCHAR(1000),
    -- Mirrors submitted_by_user_id while status = OPEN; set to NULL once the
    -- check is resolved/dismissed. A plain UNIQUE constraint then only ever
    -- blocks two *simultaneously open* flags from the same user on the same
    -- food (NULL never collides with NULL in a unique constraint), so a user
    -- can flag the same food again later if it's edited wrong again after a
    -- prior flag was closed. Avoids a partial/filtered unique index, which
    -- Postgres supports but H2 (used in tests) does not.
    open_submitted_by_user_id UUID,
    CONSTRAINT pk_food_macro_checks PRIMARY KEY (id),
    CONSTRAINT uq_food_macro_checks_open_submitter UNIQUE (target_food_id, open_submitted_by_user_id),
    CONSTRAINT chk_food_macro_checks_status CHECK (status IN ('OPEN', 'RESOLVED', 'DISMISSED'))
);

CREATE INDEX idx_food_macro_checks_status_created ON food_macro_checks (status, created_at);
