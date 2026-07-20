ALTER TABLE weight_entries
    ADD COLUMN source_medication_entry_id UUID REFERENCES medication_log_entries(id) ON DELETE CASCADE;

CREATE INDEX idx_weight_entries_source_medication_entry ON weight_entries (source_medication_entry_id);
