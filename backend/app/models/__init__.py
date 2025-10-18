from app.database import Base
from .clientes import Cliente
from .honorarios import Honorario
from .status import Status
from .pagamentos import Pagamento
from .tipo_pagamento import TipoPagamento

__all__ = [
    'Cliente',
    'Honorario',
    'Status',
    'Pagamento',
    'TipoPagamento'
]