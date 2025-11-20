from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_usuario_id
from app.schemas.clientes import Cliente, ClienteCreate
from app.services.crud_clientes import (
    get_clientes,
    get_cliente_by_id,
    create_cliente,
    update_cliente,
    delete_cliente
)

router = APIRouter(
    prefix="/clientes", 
    tags=["clientes"]
)

@router.get("/", response_model=List[Cliente])
def listar_clientes(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    return get_clientes(db, usuario_id)

@router.get("/{cliente_id}", response_model=Cliente)
def obter_cliente(
    cliente_id: int, 
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    cliente = get_cliente_by_id(db, cliente_id, usuario_id)
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente

@router.post("/", response_model=Cliente)
def criar_cliente(
    cliente: ClienteCreate, 
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    return create_cliente(db, cliente, usuario_id)

@router.put("/{cliente_id}", response_model=Cliente)
def atualizar_cliente(
    cliente_id: int, 
    cliente: ClienteCreate, 
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    db_cliente = update_cliente(db, cliente_id, cliente, usuario_id)
    if db_cliente is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return db_cliente

@router.delete("/{cliente_id}")
def remover_cliente(
    cliente_id: int, 
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    if not delete_cliente(db, cliente_id, usuario_id):
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return {"message": "Cliente removido com sucesso"}