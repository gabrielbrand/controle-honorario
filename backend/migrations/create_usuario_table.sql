-- Criar tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    senha VARCHAR NOT NULL
);

-- Criar índice único para email (já criado automaticamente pelo UNIQUE, mas deixando explícito)
CREATE INDEX IF NOT EXISTS ix_usuarios_email ON usuarios(email);

