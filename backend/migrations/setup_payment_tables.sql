-- Dropar tabelas existentes
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS tipos_pagamento CASCADE;

-- Criar tabela tipos_pagamento
CREATE TABLE tipos_pagamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao VARCHAR
);

-- Inserir tipos de pagamento padrão
INSERT INTO tipos_pagamento (nome, descricao) VALUES
    ('PIX', 'Pagamento via PIX'),
    ('BOLETO', 'Pagamento via boleto bancário'),
    ('CARTAO', 'Pagamento com cartão de crédito/débito'),
    ('DINHEIRO', 'Pagamento em dinheiro'),
    ('TRANSFERENCIA', 'Pagamento via transferência bancária');

-- Criar tabela pagamentos
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    honorario_id INTEGER NOT NULL REFERENCES honorarios(id),
    valor FLOAT NOT NULL,
    data_pagamento DATE DEFAULT CURRENT_DATE,
    tipo_pagamento_id INTEGER NOT NULL REFERENCES tipos_pagamento(id),
    observacao VARCHAR
);

-- Criar índices para melhor performance
CREATE INDEX idx_pagamentos_honorario ON pagamentos(honorario_id);
CREATE INDEX idx_pagamentos_tipo ON pagamentos(tipo_pagamento_id); 