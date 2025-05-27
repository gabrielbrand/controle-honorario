-- Dropar todas as tabelas em ordem correta devido às dependências
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS honorarios CASCADE;
DROP TABLE IF EXISTS contadores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS status CASCADE;

-- Criar tabela status primeiro
CREATE TABLE status (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao VARCHAR
);

-- Inserir status padrão
INSERT INTO status (nome, descricao) VALUES
    ('PENDENTE', 'Honorário pendente de pagamento'),
    ('PAGO', 'Honorário pago completamente'),
    ('ATRASADO', 'Honorário com pagamento atrasado');

-- Criar tabela contadores
CREATE TABLE contadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    email VARCHAR,
    telefone VARCHAR
);

-- Criar tabela clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    email VARCHAR,
    telefone VARCHAR,
    endereco VARCHAR,
    cidade VARCHAR,
    estado VARCHAR,
    cep VARCHAR,
    data_cadastro DATE DEFAULT CURRENT_DATE
);

-- Criar tabela honorarios
CREATE TABLE honorarios (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    contador_id INTEGER REFERENCES contadores(id),
    valor FLOAT NOT NULL DEFAULT 0,
    status_id INTEGER REFERENCES status(id) DEFAULT 1,
    data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    descricao VARCHAR
);

-- Criar tabela pagamentos
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    honorario_id INTEGER NOT NULL REFERENCES honorarios(id),
    valor FLOAT NOT NULL,
    data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_pagamento VARCHAR,
    status_id INTEGER REFERENCES status(id) DEFAULT 1,
    observacao VARCHAR
);

-- Atualizar tabela contadores
ALTER TABLE contadores
DROP COLUMN IF EXISTS senha,
ADD COLUMN IF NOT EXISTS email VARCHAR,
ADD COLUMN IF NOT EXISTS telefone VARCHAR;

-- Atualizar tabela clientes
ALTER TABLE clientes
ALTER COLUMN data_cadastro TYPE DATE USING data_cadastro::DATE;

-- Atualizar as colunas existentes para remover a parte da hora
UPDATE clientes SET data_cadastro = data_cadastro::DATE; 