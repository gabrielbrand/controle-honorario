from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_usuario_id
from app.schemas.pagamentos import Pagamento, PagamentoCreate, PagamentoUpdate
from app.services import crud_pagamentos

router = APIRouter(prefix="/pagamentos", tags=["pagamentos"])

@router.get("/", response_model=List[Pagamento])
def listar_pagamentos(
    honorario_id: int | None = None,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Lista todos os pagamentos com opções de filtro.
    """
    return crud_pagamentos.get_pagamentos(
        db,
        usuario_id,
        honorario_id=honorario_id
    )

@router.post("/", response_model=Pagamento)
def criar_pagamento(
    pagamento: PagamentoCreate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Cria um novo pagamento.
    """
    return crud_pagamentos.create_pagamento(db, pagamento, usuario_id)

@router.put("/{pagamento_id}", response_model=Pagamento)
def atualizar_pagamento(
    pagamento_id: int,
    pagamento: PagamentoUpdate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Atualiza um pagamento existente.
    """
    return crud_pagamentos.update_pagamento(db, pagamento_id, pagamento, usuario_id)

@router.patch("/{pagamento_id}/soft-delete")
def soft_delete_pagamento(
    pagamento_id: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Marca um pagamento como excluído.
    """
    if crud_pagamentos.delete_pagamento(db, pagamento_id, usuario_id):
        return {"message": "Pagamento marcado como excluído com sucesso"} 