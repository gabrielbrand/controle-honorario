-- ============================================================
-- SCRIPT DE VERIFICAÇÃO: Verificar se usuario_id foi adicionado corretamente
-- ============================================================
-- Execute este script APÓS executar a migration add_usuario_id_to_tables.sql
-- ============================================================

-- Verifica se as colunas existem e quantos registros têm usuario_id
SELECT 
    'clientes' as tabela, 
    COUNT(*) as total_registros, 
    COUNT(usuario_id) as registros_com_usuario_id,
    COUNT(*) - COUNT(usuario_id) as registros_sem_usuario_id
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

-- Verifica se há usuários cadastrados
SELECT 
    'Total de usuários' as info,
    COUNT(*) as quantidade
FROM usuarios;

