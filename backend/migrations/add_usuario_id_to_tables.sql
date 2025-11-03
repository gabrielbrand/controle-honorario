-- ============================================================
-- MIGRATION: Adicionar usuario_id às tabelas para isolamento por usuário
-- ============================================================
-- Execute este script COMPLETO no Supabase SQL Editor
-- ============================================================

-- ETAPA 1: Criar tabela usuarios (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        CREATE TABLE usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL
        );
        RAISE NOTICE 'Tabela usuarios criada';
    ELSE
        RAISE NOTICE 'Tabela usuarios já existe';
    END IF;
END $$;

-- ETAPA 2: Adicionar coluna usuario_id nas tabelas
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
ALTER TABLE honorarios ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS usuario_id INTEGER;

-- ETAPA 3: Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_honorarios_usuario_id ON honorarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_usuario_id ON pagamentos(usuario_id);

-- ETAPA 4: Atribuir dados existentes ao primeiro usuário (se houver usuários)
DO $$
DECLARE
    primeiro_usuario_id INTEGER;
BEGIN
    SELECT id INTO primeiro_usuario_id FROM usuarios ORDER BY id ASC LIMIT 1;
    
    IF primeiro_usuario_id IS NOT NULL THEN
        UPDATE clientes SET usuario_id = primeiro_usuario_id WHERE usuario_id IS NULL;
        UPDATE honorarios SET usuario_id = primeiro_usuario_id WHERE usuario_id IS NULL;
        UPDATE pagamentos SET usuario_id = primeiro_usuario_id WHERE usuario_id IS NULL;
        RAISE NOTICE 'Dados existentes atribuídos ao usuário ID: %', primeiro_usuario_id;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado. Os dados novos serão atribuídos quando você criar o primeiro usuário.';
    END IF;
END $$;

-- ETAPA 5: Tornar NOT NULL (só funciona se não houver NULLs)
DO $$
BEGIN
    -- Verifica se há NULLs
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE usuario_id IS NULL) AND
       NOT EXISTS (SELECT 1 FROM honorarios WHERE usuario_id IS NULL) AND
       NOT EXISTS (SELECT 1 FROM pagamentos WHERE usuario_id IS NULL) THEN
        ALTER TABLE clientes ALTER COLUMN usuario_id SET NOT NULL;
        ALTER TABLE honorarios ALTER COLUMN usuario_id SET NOT NULL;
        ALTER TABLE pagamentos ALTER COLUMN usuario_id SET NOT NULL;
        RAISE NOTICE 'Colunas usuario_id definidas como NOT NULL com sucesso!';
    ELSE
        RAISE NOTICE 'AVISO: Ainda existem registros com usuario_id NULL. Não foi possível definir como NOT NULL.';
    END IF;
END $$;

-- ============================================================
-- MIGRATION CONCLUÍDA
-- ============================================================
