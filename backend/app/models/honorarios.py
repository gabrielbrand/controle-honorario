from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import date
from app.database import Base
from app.models.contadores import Contador
from app.models.clientes import Cliente
from app.models.pagamentos import Pagamento
from app.models.status import Status

class Honorario(Base):
    __tablename__ = "honorarios"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    contador_id = Column(Integer, ForeignKey("contadores.id"))
    valor = Column(Float, nullable=False)
    status_id = Column(Integer, ForeignKey("status.id"))
    data_criacao = Column(Date, default=date.today)
    data_vencimento = Column(Date, nullable=False)
    mes_referencia = Column(String(7), nullable=False)
    descricao = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)

    cliente = relationship("Cliente", back_populates="honorarios")
    contador = relationship("Contador", back_populates="honorarios")
    status = relationship("Status")
    pagamentos = relationship("Pagamento", back_populates="honorario", lazy="dynamic")
