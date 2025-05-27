from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.tipo_pagamento import TipoPagamento, TipoPagamentoCreate
from app.services import crud_tipo_pagamento

router = APIRouter(prefix="/tipos-pagamento", tags=["tipos_pagamento"])

@router.get("/", response_model=List[TipoPagamento])
def listar_tipos_pagamento(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lista todos os tipos de pagamento com paginação.
    """
    return crud_tipo_pagamento.get_tipos_pagamento(db, skip=skip, limit=limit)

@router.get("/{tipo_id}", response_model=TipoPagamento)
def obter_tipo_pagamento(
    tipo_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém um tipo de pagamento específico pelo ID.
    """
    return crud_tipo_pagamento.get_tipo_pagamento_by_id(db, tipo_id)

@router.post("/", response_model=TipoPagamento)
def criar_tipo_pagamento(
    tipo: TipoPagamentoCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo tipo de pagamento.
    """
    return crud_tipo_pagamento.create_tipo_pagamento(db, tipo) 