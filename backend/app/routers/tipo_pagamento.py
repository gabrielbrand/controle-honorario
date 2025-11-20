from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.tipo_pagamento import TipoPagamento
from app.services import crud_tipo_pagamento

router = APIRouter(prefix="/tipos-pagamento", tags=["tipos_pagamento"])

@router.get("/", response_model=List[TipoPagamento])
def listar_tipos_pagamento(
    db: Session = Depends(get_db)
):
    """
    Lista todos os tipos de pagamento.
    """
    return crud_tipo_pagamento.get_tipos_pagamento(db) 