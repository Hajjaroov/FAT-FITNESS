CREATE TABLE medication_log_entries (
    id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    entry_date DATE NOT NULL,
    dose_mg DECIMAL(6, 2) NOT NULL,
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_medication_log_entries PRIMARY KEY (id)
);

CREATE INDEX idx_medication_log_entries_user_date ON medication_log_entries (user_id, entry_date);
