-- Adicionar a coluna mes_referencia na tabela honorarios
ALTER TABLE honorarios 
ADD COLUMN mes_referencia DATE;

-- Atualizar os registros existentes para usar a data_vencimento como mes_referencia inicialmente
UPDATE honorarios 
SET mes_referencia = DATE_TRUNC('month', data_vencimento)
WHERE mes_referencia IS NULL; 