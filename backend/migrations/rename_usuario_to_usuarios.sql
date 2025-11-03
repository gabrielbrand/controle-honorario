-- ============================================================
-- MIGRATION: Renomear tabela usuario para usuarios
-- ============================================================
-- Execute este script no Supabase SQL Editor se a tabela 'usuario' já existir
-- ============================================================

-- Renomear a tabela se ela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuario') THEN
        ALTER TABLE usuario RENAME TO usuarios;
        RAISE NOTICE 'Tabela usuario renomeada para usuarios';
    ELSE
        RAISE NOTICE 'Tabela usuario não existe. Nada a fazer.';
    END IF;
END $$;

-- Renomear o índice se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'usuarios' AND indexname = 'ix_usuario_email') THEN
        ALTER INDEX ix_usuario_email RENAME TO ix_usuarios_email;
        RAISE NOTICE 'Índice ix_usuario_email renomeado para ix_usuarios_email';
    END IF;
END $$;

-- ============================================================
-- MIGRATION CONCLUÍDA
-- ============================================================

