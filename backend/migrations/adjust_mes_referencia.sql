-- Remover a coluna antiga se existir
ALTER TABLE honorarios DROP COLUMN IF EXISTS mes_referencia;

-- Adicionar a nova coluna como VARCHAR(7) para armazenar no formato 'YYYY-MM'
ALTER TABLE honorarios ADD COLUMN mes_referencia VARCHAR(7);

-- Atualizar os registros existentes para usar apenas mês e ano da data_vencimento
UPDATE honorarios 
SET mes_referencia = TO_CHAR(data_vencimento, 'YYYY-MM')
WHERE mes_referencia IS NULL; 