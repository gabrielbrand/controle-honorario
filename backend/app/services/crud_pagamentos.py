from sqlalchemy.orm import Session, joinedload
from app.models.pagamentos import Pagamento
from app.models.honorarios import Honorario
from app.schemas.pagamentos import PagamentoCreate, PagamentoUpdate
from fastapi import HTTPException

def get_pagamentos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    honorario_id: int | None = None
):
    query = db.query(Pagamento).join(
        Pagamento.honorario
    ).options(
        joinedload(Pagamento.honorario).joinedload(Honorario.cliente),
        joinedload(Pagamento.tipo_pagamento)
    ).filter(Pagamento.is_deleted == False)
    
    if honorario_id:
        query = query.filter(Pagamento.honorario_id == honorario_id)
        
    return query.offset(skip).limit(limit).all()

def get_pagamento(db: Session, pagamento_id: int):
    pagamento = db.query(Pagamento).join(
        Pagamento.honorario
    ).options(
        joinedload(Pagamento.honorario).joinedload(Honorario.cliente),
        joinedload(Pagamento.tipo_pagamento)
    ).filter(Pagamento.id == pagamento_id, Pagamento.is_deleted == False).first()
    
    if not pagamento:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    return pagamento

def create_pagamento(db: Session, pagamento: PagamentoCreate):
    db_pagamento = Pagamento(**pagamento.dict(), is_deleted=False)
    try:
        db.add(db_pagamento)
        db.commit()
        db.refresh(db_pagamento)
        return db_pagamento
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def update_pagamento(db: Session, pagamento_id: int, pagamento: PagamentoUpdate):
    db_pagamento = get_pagamento(db, pagamento_id)
    
    update_data = pagamento.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pagamento, field, value)
    
    try:
        db.commit()
        db.refresh(db_pagamento)
        return db_pagamento
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def delete_pagamento(db: Session, pagamento_id: int):
    db_pagamento = get_pagamento(db, pagamento_id)
    try:
        db_pagamento.is_deleted = True
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def restore_pagamento(db: Session, pagamento_id: int):
    pagamento = db.query(Pagamento).filter(
        Pagamento.id == pagamento_id
    ).first()
    
    if not pagamento:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
        
    try:
        pagamento.is_deleted = False
        db.commit()
        return pagamento
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e)) 