from fastapi import Header, HTTPException
from typing import Optional

def get_usuario_id(user_id: Optional[int] = Header(None, alias="user-id")) -> int:
    """Obtém o ID do usuário do header da requisição"""
    if user_id is None:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")
    return user_id

