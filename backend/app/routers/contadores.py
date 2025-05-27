from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.contadores import Contador, ContadorCreate
from app.services.crud_contadores import (
    get_contadores,
    get_contador_by_id,
    create_contador,
    update_contador,
    delete_contador
)

router = APIRouter(
    prefix="/contadores", 
    tags=["contadores"]
)

@router.get("/", response_model=List[Contador])
def listar_contadores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_contadores(db, skip=skip, limit=limit)

@router.get("/{contador_id}", response_model=Contador)
def obter_contador(contador_id: int, db: Session = Depends(get_db)):
    contador = get_contador_by_id(db, contador_id)
    if contador is None:
        raise HTTPException(status_code=404, detail="Contador não encontrado")
    return contador

@router.post("/", response_model=Contador)
def criar_contador(contador: ContadorCreate, db: Session = Depends(get_db)):
    return create_contador(db, contador)

@router.put("/{contador_id}", response_model=Contador)
def atualizar_contador(contador_id: int, contador: ContadorCreate, db: Session = Depends(get_db)):
    db_contador = update_contador(db, contador_id, contador)
    if db_contador is None:
        raise HTTPException(status_code=404, detail="Contador não encontrado")
    return db_contador

@router.delete("/{contador_id}")
def remover_contador(contador_id: int, db: Session = Depends(get_db)):
    if not delete_contador(db, contador_id):
        raise HTTPException(status_code=404, detail="Contador não encontrado")
    return {"message": "Contador removido com sucesso"} 