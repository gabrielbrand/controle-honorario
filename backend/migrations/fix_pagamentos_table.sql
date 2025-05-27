-- Dropar a tabela pagamentos se existir
DROP TABLE IF EXISTS pagamentos CASCADE;

-- Recriar a tabela pagamentos com a estrutura correta
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    honorario_id INTEGER NOT NULL REFERENCES honorarios(id),
    valor FLOAT NOT NULL,
    data_pagamento DATE DEFAULT CURRENT_DATE,
    tipo_pagamento_id INTEGER REFERENCES tipos_pagamento(id),
    observacao VARCHAR
); 