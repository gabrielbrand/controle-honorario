from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class TipoPagamento(Base):
    __tablename__ = "tipos_pagamento"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, unique=True)
    descricao = Column(String)

    pagamentos = relationship("Pagamento", back_populates="tipo_pagamento") 