from fastapi import Header, HTTPException
from typing import Optional

def get_usuario_id(x_user_id: Optional[int] = Header(None, alias="X-User-Id")) -> int:
    """Obtém o ID do usuário do header da requisição"""
    if x_user_id is None:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")
    return x_user_id

