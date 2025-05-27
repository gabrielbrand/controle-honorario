-- Dropar as tabelas na ordem correta
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS tipos_pagamento CASCADE;

-- Criar tabela de tipos de pagamento primeiro
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
    ('TRANSFERENCIA', 'Pagamento via transferência bancária')
ON CONFLICT (nome) DO NOTHING;

-- Criar tabela de pagamentos depois
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    honorario_id INTEGER NOT NULL REFERENCES honorarios(id),
    valor FLOAT NOT NULL,
    data_pagamento DATE DEFAULT CURRENT_DATE,
    tipo_pagamento_id INTEGER REFERENCES tipos_pagamento(id),
    observacao VARCHAR
); 