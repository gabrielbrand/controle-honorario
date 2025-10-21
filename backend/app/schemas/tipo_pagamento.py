from pydantic import BaseModel

class TipoPagamentoBase(BaseModel):
    nome: str

class TipoPagamentoCreate(TipoPagamentoBase):
    pass

class TipoPagamento(TipoPagamentoBase):
    id: int

    class Config:
        orm_mode = True 