from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Contador(Base):
    __tablename__ = "contadores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True, nullable=False)
    email = Column(String, index=True)
    telefone = Column(String)

    honorarios = relationship("Honorario", back_populates="contador", lazy="dynamic")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

