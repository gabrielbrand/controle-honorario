from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.status import Status, StatusCreate
from app.services import crud_status

router = APIRouter(prefix="/status", tags=["status"])

@router.get("/", response_model=List[Status])
def listar_status(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lista todos os status com paginação.
    """
    return crud_status.get_status(db, skip=skip, limit=limit)

@router.get("/{status_id}", response_model=Status)
def obter_status(
    status_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém um status específico pelo ID.
    """
    return crud_status.get_status_by_id(db, status_id)

@router.post("/", response_model=Status)
def criar_status(
    status: StatusCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo status.
    """
    return crud_status.create_status(db, status)

@router.put("/{status_id}", response_model=Status)
def atualizar_status(
    status_id: int,
    status: StatusCreate,
    db: Session = Depends(get_db)
):
    """
    Atualiza um status existente.
    """
    return crud_status.update_status(
        db,
        status_id=status_id,
        nome=status.nome,
        descricao=status.descricao
    )

@router.delete("/{status_id}")
def deletar_status(
    status_id: int,
    db: Session = Depends(get_db)
):
    """
    Remove um status.
    """
    if crud_status.delete_status(db, status_id):
        return {"message": "Status removido com sucesso"} 