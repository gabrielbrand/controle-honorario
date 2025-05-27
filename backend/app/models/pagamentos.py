from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import date
from app.database import Base

class Pagamento(Base):
    __tablename__ = "pagamentos"

    id = Column(Integer, primary_key=True, index=True)
    honorario_id = Column(Integer, ForeignKey("honorarios.id"), nullable=False)
    valor = Column(Float, nullable=False)
    data_pagamento = Column(Date, default=date.today)
    tipo_pagamento_id = Column(Integer, ForeignKey("tipos_pagamento.id"), nullable=False)
    observacao = Column(String)
    is_deleted = Column(Boolean, default=False)

    honorario = relationship("Honorario", back_populates="pagamentos")
    tipo_pagamento = relationship("TipoPagamento", back_populates="pagamentos")