from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.pagamentos import Pagamento, PagamentoCreate, PagamentoUpdate
from app.services import crud_pagamentos

router = APIRouter(prefix="/pagamentos", tags=["pagamentos"])

@router.get("/", response_model=List[Pagamento])
def listar_pagamentos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    honorario_id: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Lista todos os pagamentos com opções de filtro e paginação.
    """
    return crud_pagamentos.get_pagamentos(
        db,
        skip=skip,
        limit=limit,
        honorario_id=honorario_id
    )

@router.get("/{pagamento_id}", response_model=Pagamento)
def obter_pagamento(
    pagamento_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém um pagamento específico pelo ID.
    """
    return crud_pagamentos.get_pagamento(db, pagamento_id)

@router.post("/", response_model=Pagamento)
def criar_pagamento(
    pagamento: PagamentoCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo pagamento.
    """
    return crud_pagamentos.create_pagamento(db, pagamento)

@router.put("/{pagamento_id}", response_model=Pagamento)
def atualizar_pagamento(
    pagamento_id: int,
    pagamento: PagamentoUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza um pagamento existente.
    """
    return crud_pagamentos.update_pagamento(db, pagamento_id, pagamento)

@router.patch("/{pagamento_id}/soft-delete")
def soft_delete_pagamento(
    pagamento_id: int,
    db: Session = Depends(get_db)
):
    """
    Marca um pagamento como excluído.
    """
    if crud_pagamentos.delete_pagamento(db, pagamento_id):
        return {"message": "Pagamento marcado como excluído com sucesso"}

@router.patch("/{pagamento_id}/restore")
def restaurar_pagamento(
    pagamento_id: int,
    db: Session = Depends(get_db)
):
    """
    Restaura um pagamento marcado como excluído.
    """
    pagamento = crud_pagamentos.restore_pagamento(db, pagamento_id)
    return {"message": "Pagamento restaurado com sucesso", "pagamento": pagamento}

@router.delete("/{pagamento_id}")
def deletar_pagamento(
    pagamento_id: int,
    db: Session = Depends(get_db)
):
    """
    Remove um pagamento.
    """
    if crud_pagamentos.delete_pagamento(db, pagamento_id):
        return {"message": "Pagamento removido com sucesso"} 