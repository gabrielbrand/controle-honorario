# API Controle de Honorários

## 🚀 Como usar

### 1. Configurar banco de dados
- Certifique-se que o PostgreSQL está rodando
- Crie o banco `controle_honorarios`
- Configure as credenciais no arquivo `.env` (copie de `env_example.txt`)

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Iniciar servidor
```bash
python start.py
```

### 4. Acessar API
- **API**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs

## 📋 Endpoints disponíveis

- `/clientes` - Gerenciar clientes
- `/honorarios` - Gerenciar honorários  
- `/pagamentos` - Gerenciar pagamentos
- `/contadores` - Gerenciar contadores
- `/status` - Gerenciar status
- `/tipo_pagamento` - Gerenciar tipos de pagamento
- `/dashboard` - Dashboard com estatísticas
