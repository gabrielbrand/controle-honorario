from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from datetime import datetime
from typing import Optional, List
from app.models.honorarios import Honorario
from app.schemas.honorarios import HonorarioCreate, HonorarioUpdate
from fastapi import HTTPException

def get_honorarios(
    db: Session,
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    cliente_id: int | None = None,
    status_id: int | None = None
) -> List[Honorario]:
    query = db.query(Honorario).join(
        Honorario.cliente
    ).options(
        joinedload(Honorario.cliente),
        joinedload(Honorario.status)
    ).filter(
        and_(
            Honorario.usuario_id == usuario_id,
            Honorario.is_deleted == False
        )
    )
    
    if cliente_id:
        query = query.filter(Honorario.cliente_id == cliente_id)
    if status_id:
        query = query.filter(Honorario.status_id == status_id)
        
    honorarios = query.offset(skip).limit(limit).all()
    
    for honorario in honorarios:
        if honorario.mes_referencia is None:
            hoje = datetime.now()
            honorario.mes_referencia = f"{hoje.year}-{str(hoje.month).zfill(2)}"
            db.commit()
    
    return honorarios

def get_honorario(db: Session, honorario_id: int, usuario_id: int) -> Honorario:
    honorario = db.query(Honorario).join(
        Honorario.cliente
    ).options(
        joinedload(Honorario.cliente),
        joinedload(Honorario.status)
    ).filter(
        and_(
            Honorario.id == honorario_id,
            Honorario.usuario_id == usuario_id,
            Honorario.is_deleted == False
        )
    ).first()
    
    if not honorario:
        raise HTTPException(status_code=404, detail="Honorário não encontrado")
    return honorario

def create_honorario(db: Session, honorario: HonorarioCreate, usuario_id: int) -> Honorario:
    honorario_data = honorario.dict()
    honorario_data['usuario_id'] = usuario_id
    
    if 'status_id' not in honorario_data or honorario_data['status_id'] is None:
        honorario_data['status_id'] = 1
    
    if 'mes_referencia' not in honorario_data or honorario_data['mes_referencia'] is None:
        hoje = datetime.now()
        honorario_data['mes_referencia'] = f"{hoje.year}-{str(hoje.month).zfill(2)}"
    
    db_honorario = Honorario(**honorario_data)
    
    try:
        db.add(db_honorario)
        db.commit()
        db.refresh(db_honorario)
        return db_honorario
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao criar honorário: {str(e)}")

def update_honorario(
    db: Session,
    honorario_id: int,
    honorario_update: HonorarioUpdate,
    usuario_id: int
) -> Honorario:
    db_honorario = get_honorario(db, honorario_id, usuario_id)
    
    update_data = honorario_update.dict(exclude_unset=True)
    
    if 'mes_referencia' in update_data and update_data['mes_referencia'] is None:
        hoje = datetime.now()
        update_data['mes_referencia'] = f"{hoje.year}-{str(hoje.month).zfill(2)}"
    
    for field, value in update_data.items():
        setattr(db_honorario, field, value)
    
    try:
        db.commit()
        db.refresh(db_honorario)
        return db_honorario
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def delete_honorario(db: Session, honorario_id: int, usuario_id: int) -> bool:
    db_honorario = get_honorario(db, honorario_id, usuario_id)
    
    try:
        db_honorario.is_deleted = True
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def restore_honorario(db: Session, honorario_id: int, usuario_id: int) -> Honorario:
    """Restaura um honorário que foi marcado como deletado"""
    honorario = db.query(Honorario).filter(
        and_(
            Honorario.id == honorario_id,
            Honorario.usuario_id == usuario_id,
            Honorario.is_deleted == True
        )
    ).first()
    
    if not honorario:
        raise HTTPException(status_code=404, detail="Honorário não encontrado ou não está deletado")
    
    try:
        honorario.is_deleted = False
        db.commit()
        db.refresh(honorario)
        return honorario
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def check_overdue_honorarios(db: Session, usuario_id: int) -> None:
    """Update status of overdue honorarios to ATRASADO"""
    from datetime import date
    
    hoje = date.today()
    
    overdue_honorarios = db.query(Honorario).filter(
        and_(
            Honorario.usuario_id == usuario_id,
            Honorario.status_id == 1,
            Honorario.data_vencimento < hoje
        )
    ).all()
    
    count = 0
    for honorario in overdue_honorarios:
        honorario.status_id = 3
        count += 1
    
    if count > 0:
        db.commit()
        print(f"Atualizados {count} honorários para status ATRASADO")
    else:
        print("Nenhum honorário atrasado encontrado")
    
    return count