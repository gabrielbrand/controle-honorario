-- ============================================================
-- SCRIPT DE VERIFICAÇÃO: Verificar se as colunas usuario_id existem
-- ============================================================

-- Verifica se as colunas usuario_id existem nas tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('clientes', 'honorarios', 'pagamentos')
  AND column_name = 'usuario_id'
ORDER BY table_name;

-- Verifica quantos registros têm usuario_id NULL
SELECT 
    'clientes' as tabela,
    COUNT(*) as total,
    COUNT(usuario_id) as com_usuario_id,
    COUNT(*) - COUNT(usuario_id) as sem_usuario_id
FROM clientes
UNION ALL
SELECT 
    'honorarios',
    COUNT(*),
    COUNT(usuario_id),
    COUNT(*) - COUNT(usuario_id)
FROM honorarios
UNION ALL
SELECT 
    'pagamentos',
    COUNT(*),
    COUNT(usuario_id),
    COUNT(*) - COUNT(usuario_id)
FROM pagamentos;

-- Se as colunas não existirem, execute o script add_usuario_id_to_tables.sql primeiro

