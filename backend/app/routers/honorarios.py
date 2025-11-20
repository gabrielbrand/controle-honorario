from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_usuario_id
from app.schemas.honorarios import (
    Honorario,
    HonorarioCreate,
    HonorarioUpdate
)
from app.services import crud_honorarios

router = APIRouter(prefix="/honorarios", tags=["honorarios"])

@router.get("/", response_model=List[Honorario])
def listar_honorarios(
    cliente_id: int | None = None,
    status_id: int | None = None,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Lista todos os honorários com opções de filtro.
    """
    return crud_honorarios.get_honorarios(
        db,
        usuario_id,
        cliente_id=cliente_id,
        status_id=status_id
    )

@router.post("/", response_model=Honorario)
def criar_honorario(
    honorario: HonorarioCreate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Cria um novo honorário.
    """
    return crud_honorarios.create_honorario(db, honorario, usuario_id)

@router.put("/{honorario_id}", response_model=Honorario)
def atualizar_honorario(
    honorario_id: int,
    honorario: HonorarioUpdate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Atualiza um honorário existente.
    """
    return crud_honorarios.update_honorario(db, honorario_id, honorario, usuario_id)

@router.post("/verificar-atrasados")
def verificar_honorarios_atrasados(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Verifica e atualiza o status dos honorários atrasados.
    """
    count = crud_honorarios.check_overdue_honorarios(db, usuario_id)
    return {
        "message": f"Verificação concluída. {count} honorários atualizados para ATRASADO",
        "updated_count": count
    }