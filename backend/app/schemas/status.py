from pydantic import BaseModel

class StatusBase(BaseModel):
    nome: str
    descricao: str | None = None

class StatusCreate(StatusBase):
    pass

class Status(StatusBase):
    id: int

    class Config:
        orm_mode = True 