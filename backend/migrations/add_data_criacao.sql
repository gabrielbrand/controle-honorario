-- Primeiro, converte todos os registros existentes para usar apenas a data
UPDATE clientes 
SET data_criacao = DATE(data_criacao::timestamp)
WHERE data_criacao IS NOT NULL;

-- Altera o tipo da coluna para DATE
ALTER TABLE clientes 
ALTER COLUMN data_criacao TYPE DATE USING data_criacao::date;

-- Define o valor padrão como CURRENT_DATE
ALTER TABLE clientes 
ALTER COLUMN data_criacao SET DEFAULT CURRENT_DATE; 