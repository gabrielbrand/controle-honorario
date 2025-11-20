from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import clientes, honorarios, pagamentos, tipo_pagamento, dashboard, auth
from app import models  # Isso importa os modelos e garante que as tabelas sejam criadas

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Controle de Honorários API")

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes.router)
app.include_router(honorarios.router)
app.include_router(pagamentos.router)
app.include_router(tipo_pagamento.router)
app.include_router(dashboard.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API de Controle de Honorários"}