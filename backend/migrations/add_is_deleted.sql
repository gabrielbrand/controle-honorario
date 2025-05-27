-- Adiciona a coluna is_deleted
ALTER TABLE honorarios ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Atualiza registros existentes
UPDATE honorarios SET is_deleted = FALSE WHERE is_deleted IS NULL; 