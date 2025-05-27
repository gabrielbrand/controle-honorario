-- Remove address-related columns from clientes table
ALTER TABLE clientes
DROP COLUMN IF EXISTS endereco,
DROP COLUMN IF EXISTS cidade,
DROP COLUMN IF EXISTS estado,
DROP COLUMN IF EXISTS cep,
DROP COLUMN IF EXISTS data_cadastro;

-- Add is_deleted column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'clientes' AND column_name = 'is_deleted') THEN
        ALTER TABLE clientes ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
END $$; 