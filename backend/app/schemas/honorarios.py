from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from typing import Optional
import re
from app.schemas.clientes import Cliente
from app.schemas.status import Status

class HonorarioBase(BaseModel):
    valor: float = Field(..., gt=0, description="Valor do honorário")
    cliente_id: int
    data_vencimento: date
    mes_referencia: str = Field(
        default_factory=lambda: datetime.now().strftime("%Y-%m"),
        pattern=r'^\d{4}-(?:0[1-9]|1[0-2])$',
        description="Mês de referência no formato YYYY-MM"
    )
    descricao: Optional[str] = None

    @validator('mes_referencia')
    def validate_mes_referencia(cls, v):
        if not v:
            # Se não houver valor, usar mês atual
            hoje = datetime.now()
            return f"{hoje.year}-{str(hoje.month).zfill(2)}"
        
        if not isinstance(v, str):
            raise ValueError('mes_referencia deve ser uma string')
            
        if not re.match(r'^\d{4}-(?:0[1-9]|1[0-2])$', v):
            raise ValueError('mes_referencia deve estar no formato YYYY-MM (exemplo: 2024-03)')
            
        # Validar se o ano está em um intervalo razoável
        ano = int(v.split('-')[0])
        if ano < 2000 or ano > 2100:
            raise ValueError('Ano deve estar entre 2000 e 2100')
            
        return v

class HonorarioCreate(HonorarioBase):
    status_id: Optional[int] = 1    # Padrão para PENDENTE

class HonorarioUpdate(BaseModel):
    valor: Optional[float] = Field(None, gt=0)
    status_id: Optional[int] = None
    data_vencimento: Optional[date] = None
    mes_referencia: Optional[str] = Field(
        None,
        pattern=r'^\d{4}-(?:0[1-9]|1[0-2])$'
    )
    descricao: Optional[str] = None

    @validator('mes_referencia')
    def validate_mes_referencia(cls, v):
        if v is None:
            # Se não houver valor, usar mês atual
            hoje = datetime.now()
            return f"{hoje.year}-{str(hoje.month).zfill(2)}"
            
        if not isinstance(v, str):
            raise ValueError('mes_referencia deve ser uma string')
            
        if not re.match(r'^\d{4}-(?:0[1-9]|1[0-2])$', v):
            raise ValueError('mes_referencia deve estar no formato YYYY-MM (exemplo: 2024-03)')
            
        # Validar se o ano está em um intervalo razoável
        ano = int(v.split('-')[0])
        if ano < 2000 or ano > 2100:
            raise ValueError('Ano deve estar entre 2000 e 2100')
            
        return v

class Honorario(HonorarioBase):
    id: int
    data_criacao: date
    status_id: int
    notificado: bool = False
    notificado1a: bool = False
    notificado3: bool = False
    cliente: Optional[Cliente]
    status: Optional[Status]

    class Config:
        from_attributes = True