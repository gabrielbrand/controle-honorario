from sqlalchemy import Column, Integer, String, Boolean, Date
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import date
from sqlalchemy.sql import text

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String)
    telefone = Column(String)
    is_deleted = Column(Boolean, default=False)
    data_criacao = Column(Date, server_default=text('CURRENT_DATE'))
    
    honorarios = relationship("Honorario", back_populates="cliente")

    def __init__(self, **kwargs):
        if 'data_criacao' in kwargs:
            if isinstance(kwargs['data_criacao'], str):
                kwargs['data_criacao'] = date.fromisoformat(kwargs['data_criacao'].split('T')[0])
            elif hasattr(kwargs['data_criacao'], 'date'):
                kwargs['data_criacao'] = kwargs['data_criacao'].date()
        super().__init__(**kwargs)

    @property
    def data_criacao_formatted(self):
        if isinstance(self.data_criacao, datetime):
            return self.data_criacao.date()
        return self.data_criacao