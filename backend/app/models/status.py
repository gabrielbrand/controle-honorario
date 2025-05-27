from sqlalchemy import Column, Integer, String
from app.database import Base

class Status(Base):
    __tablename__ = "status"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, unique=True)
    descricao = Column(String)

    def __init__(self, **kwargs):
        super().__init__(**kwargs) 