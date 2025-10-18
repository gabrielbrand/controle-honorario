#!/bin/bash

# Script de inicialização para o backend
echo "🚀 Iniciando Controle de Honorários Backend..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não está definida"
    exit 1
fi

echo "📊 Executando migrações do banco de dados..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ Migrações executadas com sucesso"
else
    echo "❌ Erro ao executar migrações"
    exit 1
fi

echo "🌐 Iniciando servidor FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
