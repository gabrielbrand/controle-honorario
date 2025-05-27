from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime

class ClienteBase(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(ClienteBase):
    pass

class Cliente(ClienteBase):
    id: int
    is_deleted: bool = False
    data_criacao: date

    @field_validator('data_criacao', mode='before')
    @classmethod
    def convert_datetime_to_date(cls, v):
        if isinstance(v, datetime):
            return v.date()
        return v

    class Config:
        from_attributes = True