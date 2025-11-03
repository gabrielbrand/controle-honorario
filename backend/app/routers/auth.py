from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import UsuarioCreate, Usuario, UsuarioLogin
from app.services.crud_usuario import create_usuario, authenticate_usuario, get_usuario_by_email

router = APIRouter(prefix="/auth", tags=["autenticacao"])

@router.get("/verificar-email/{email}")
def verificar_email(email: str, db: Session = Depends(get_db)):
    """Endpoint para verificar se email já existe"""
    usuario = get_usuario_by_email(db, email)
    return {
        "email": email,
        "disponivel": usuario is None,
        "existe": usuario is not None
    }

@router.post("/cadastro", response_model=Usuario, status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """Endpoint para cadastrar novo usuário"""
    return create_usuario(db=db, usuario=usuario)

@router.post("/login")
def login(credenciais: UsuarioLogin, db: Session = Depends(get_db)):
    """Endpoint para fazer login"""
    usuario = authenticate_usuario(db=db, email=credenciais.email, senha=credenciais.senha)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )
    
    # Retorna dados do usuário (sem senha)
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "message": "Login realizado com sucesso"
    }

