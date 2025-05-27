from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.honorarios import (
    Honorario,
    HonorarioCreate,
    HonorarioUpdate
)
from app.services import crud_honorarios

router = APIRouter(prefix="/honorarios", tags=["honorarios"])

@router.get("/", response_model=List[Honorario])
def listar_honorarios(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    cliente_id: int | None = None,
    contador_id: int | None = None,
    status_id: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Lista todos os honorários com opções de filtro e paginação.
    """
    return crud_honorarios.get_honorarios(
        db,
        skip=skip,
        limit=limit,
        cliente_id=cliente_id,
        contador_id=contador_id,
        status_id=status_id
    )

@router.get("/{honorario_id}", response_model=Honorario)
def obter_honorario(
    honorario_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém um honorário específico pelo ID.
    """
    return crud_honorarios.get_honorario(db, honorario_id)

@router.post("/", response_model=Honorario)
def criar_honorario(
    honorario: HonorarioCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo honorário.
    """
    return crud_honorarios.create_honorario(db, honorario)

@router.put("/{honorario_id}", response_model=Honorario)
def atualizar_honorario(
    honorario_id: int,
    honorario: HonorarioUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza um honorário existente.
    """
    return crud_honorarios.update_honorario(db, honorario_id, honorario)

@router.delete("/{honorario_id}")
def deletar_honorario(
    honorario_id: int,
    db: Session = Depends(get_db)
):
    """
    Remove um honorário (soft delete).
    """
    if crud_honorarios.delete_honorario(db, honorario_id):
        return {"message": "Honorário removido com sucesso"}

@router.post("/check-overdue")
def verificar_honorarios_atrasados(
    db: Session = Depends(get_db)
):
    """
    Verifica e atualiza o status dos honorários atrasados.
    """
    count = crud_honorarios.check_overdue_honorarios(db)
    return {
        "message": f"Verificação concluída. {count} honorários atualizados para ATRASADO",
        "updated_count": count
    }

@router.post("/{honorario_id}/restore")
def restaurar_honorario(
    honorario_id: int,
    db: Session = Depends(get_db)
):
    """
    Restaura um honorário que foi marcado como deletado.
    """
    honorario = crud_honorarios.restore_honorario(db, honorario_id)
    return {"message": "Honorário restaurado com sucesso", "honorario": honorario}