CREATE TABLE user_weight_goals (
    id UUID NOT NULL,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    start_weight DECIMAL(6, 2),
    goal_weight DECIMAL(6, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_user_weight_goals PRIMARY KEY (id)
);

CREATE TABLE weight_entries (
    id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    entry_date DATE NOT NULL,
    weight_kg DECIMAL(6, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_weight_entries PRIMARY KEY (id),
    CONSTRAINT uq_weight_entries_user_date UNIQUE (user_id, entry_date)
);

CREATE INDEX idx_weight_entries_user_date ON weight_entries (user_id, entry_date);
