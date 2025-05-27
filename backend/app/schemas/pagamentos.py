from pydantic import BaseModel, Field
from datetime import date
from typing import Optional
from app.schemas.honorarios import Honorario
from app.schemas.tipo_pagamento import TipoPagamento
from app.schemas.clientes import Cliente

class HonorarioWithCliente(BaseModel):
    id: int
    cliente: Optional[Cliente]
    mes_referencia: str

    class Config:
        orm_mode = True

class PagamentoBase(BaseModel):
    honorario_id: int
    valor: float = Field(..., gt=0)
    tipo_pagamento_id: int
    data_pagamento: date = Field(default_factory=date.today)
    observacao: Optional[str] = None

class PagamentoCreate(PagamentoBase):
    pass

class PagamentoUpdate(BaseModel):
    valor: Optional[float] = Field(None, gt=0)
    tipo_pagamento_id: Optional[int] = None
    data_pagamento: Optional[date] = None
    observacao: Optional[str] = None

class Pagamento(PagamentoBase):
    id: int
    honorario: Optional[HonorarioWithCliente]
    tipo_pagamento: Optional[TipoPagamento]

    class Config:
        orm_mode = True 