from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import date
from app.database import Base
from app.models.clientes import Cliente
from app.models.pagamentos import Pagamento
from app.models.status import Status

class Honorario(Base):
    __tablename__ = "honorarios"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    valor = Column(Float, nullable=False)
    status_id = Column(Integer, ForeignKey("status.id"))
    data_vencimento = Column(Date, nullable=False)
    mes_referencia = Column(String(7), nullable=False)
    descricao = Column(String, nullable=True)
    notificado = Column(Boolean, default=False, nullable=False)
    notificado1a = Column(Boolean, default=False, nullable=False)
    notificado3 = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    cliente = relationship("Cliente", back_populates="honorarios")
    status = relationship("Status")
    pagamentos = relationship("Pagamento", back_populates="honorario", lazy="dynamic")
