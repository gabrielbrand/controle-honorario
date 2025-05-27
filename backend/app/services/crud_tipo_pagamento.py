from sqlalchemy.orm import Session
from app.models.tipo_pagamento import TipoPagamento
from app.schemas.tipo_pagamento import TipoPagamentoCreate
from fastapi import HTTPException

def get_tipos_pagamento(db: Session, skip: int = 0, limit: int = 100):
    return db.query(TipoPagamento).offset(skip).limit(limit).all()

def get_tipo_pagamento_by_id(db: Session, tipo_id: int):
    tipo = db.query(TipoPagamento).filter(TipoPagamento.id == tipo_id).first()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de pagamento não encontrado")
    return tipo

def create_tipo_pagamento(db: Session, tipo: TipoPagamentoCreate):
    db_tipo = TipoPagamento(**tipo.dict())
    try:
        db.add(db_tipo)
        db.commit()
        db.refresh(db_tipo)
        return db_tipo
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e)) 