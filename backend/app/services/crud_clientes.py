from sqlalchemy.orm import Session
from app.models.clientes import Cliente
from app.schemas.clientes import ClienteCreate
from datetime import date
from sqlalchemy import func, and_
from fastapi import HTTPException

def get_clientes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Cliente).filter(Cliente.is_deleted == False).offset(skip).limit(limit).all()

def get_cliente_by_id(db: Session, cliente_id: int):
    return db.query(Cliente).filter(and_(Cliente.id == cliente_id, Cliente.is_deleted == False)).first()

def create_cliente(db: Session, cliente: ClienteCreate):
    try:
        db_cliente = Cliente(**cliente.dict())
        # Garante que data_criacao é sempre apenas a data
        db_cliente.data_criacao = date.today()
        db.add(db_cliente)
        db.commit()
        db.refresh(db_cliente)
        return db_cliente
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def update_cliente(db: Session, cliente_id: int, cliente_data: ClienteCreate):
    db_cliente = get_cliente_by_id(db, cliente_id)
    if db_cliente:
        update_data = cliente_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_cliente, key, value)
        db.commit()
        db.refresh(db_cliente)
    return db_cliente

def delete_cliente(db: Session, cliente_id: int):
    db_cliente = get_cliente_by_id(db, cliente_id)
    if db_cliente:
        db_cliente.is_deleted = True  # Soft delete
        db.commit()
        return True
    return False