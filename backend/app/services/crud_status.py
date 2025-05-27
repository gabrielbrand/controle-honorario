from sqlalchemy.orm import Session
from app.models.status import Status
from app.schemas.status import StatusCreate
from fastapi import HTTPException

def get_status(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Status).offset(skip).limit(limit).all()

def get_status_by_id(db: Session, status_id: int):
    status = db.query(Status).filter(Status.id == status_id).first()
    if not status:
        raise HTTPException(status_code=404, detail="Status não encontrado")
    return status

def get_status_by_nome(db: Session, nome: str):
    return db.query(Status).filter(Status.nome == nome).first()

def create_status(db: Session, status: StatusCreate):
    db_status = Status(**status.dict())
    try:
        db.add(db_status)
        db.commit()
        db.refresh(db_status)
        return db_status
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def update_status(db: Session, status_id: int, nome: str, descricao: str | None = None):
    db_status = get_status_by_id(db, status_id)
    db_status.nome = nome
    if descricao is not None:
        db_status.descricao = descricao
    
    try:
        db.commit()
        db.refresh(db_status)
        return db_status
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def delete_status(db: Session, status_id: int):
    db_status = get_status_by_id(db, status_id)
    try:
        db.delete(db_status)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e)) 