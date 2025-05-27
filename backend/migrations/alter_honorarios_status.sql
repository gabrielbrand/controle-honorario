-- Primeiro, remover a coluna status existente
ALTER TABLE honorarios DROP COLUMN IF EXISTS status;

-- Adicionar a coluna status_id com a referência correta
ALTER TABLE honorarios 
ADD COLUMN status_id INTEGER REFERENCES status(id) DEFAULT 1;

-- Atualizar registros existentes para usar o status_id padrão (1 = PENDENTE)
UPDATE honorarios SET status_id = 1 WHERE status_id IS NULL; 