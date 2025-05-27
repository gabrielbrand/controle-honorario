from pydantic import BaseModel
from typing import Optional

class ContadorBase(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None

class ContadorCreate(ContadorBase):
    pass

class Contador(ContadorBase):
    id: int

    class Config:
        orm_mode = True 