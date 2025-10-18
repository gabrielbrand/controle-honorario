from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env
load_dotenv()

# URL de conexão do banco de dados
# Para Supabase, use a URL fornecida no painel do projeto
# Para PostgreSQL local, use: postgresql://postgres:postgres@localhost:5432/controle_honorarios
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/controle_honorarios")

engine = create_engine(
    DATABASE_URL,
    pool_size=2,          # Reduzido para evitar limite do Supabase
    max_overflow=3,        # Máximo 5 conexões simultâneas
    pool_pre_ping=True,    # Testa conexões antes de usar
    pool_recycle=1800,     # Recicla conexões a cada 30 minutos
    pool_timeout=30        # Timeout para obter conexão do pool
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()