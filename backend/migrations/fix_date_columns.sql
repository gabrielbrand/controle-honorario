-- Alterar o tipo das colunas para DATE
ALTER TABLE honorarios 
    ALTER COLUMN data_criacao TYPE DATE USING data_criacao::DATE,
    ALTER COLUMN data_vencimento TYPE DATE USING data_vencimento::DATE;

-- Alterar o valor padrão da data_criacao
ALTER TABLE honorarios 
    ALTER COLUMN data_criacao SET DEFAULT CURRENT_DATE;

-- Atualizar os dados existentes para remover a parte da hora
UPDATE honorarios 
SET data_criacao = data_criacao::DATE,
    data_vencimento = data_vencimento::DATE
WHERE data_criacao IS NOT NULL OR data_vencimento IS NOT NULL; 