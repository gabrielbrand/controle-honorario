from sqlalchemy.orm import Session
from app.models.contadores import Contador
from app.schemas.contadores import ContadorCreate

def get_contadores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Contador).offset(skip).limit(limit).all()

def get_contador_by_id(db: Session, contador_id: int):
    return db.query(Contador).filter(Contador.id == contador_id).first()

def create_contador(db: Session, contador: ContadorCreate):
    db_contador = Contador(**contador.dict())
    db.add(db_contador)
    db.commit()
    db.refresh(db_contador)
    return db_contador

def update_contador(db: Session, contador_id: int, contador_data: ContadorCreate):
    db_contador = get_contador_by_id(db, contador_id)
    if db_contador:
        for key, value in contador_data.dict(exclude_unset=True).items():
            setattr(db_contador, key, value)
        db.commit()
        db.refresh(db_contador)
    return db_contador

def delete_contador(db: Session, contador_id: int):
    db_contador = get_contador_by_id(db, contador_id)
    if db_contador:
        db.delete(db_contador)
        db.commit()
        return True
    return False 