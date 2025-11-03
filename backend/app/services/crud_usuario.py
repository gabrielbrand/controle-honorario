from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
import bcrypt
from fastapi import HTTPException
from sqlalchemy import and_

def get_password_hash(password: str) -> str:
    """Gera hash da senha usando bcrypt"""
    # Bcrypt tem limite de 72 bytes
    password_bytes = password.encode('utf-8')
    
    # Se exceder 72 bytes, trunca
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        # Tenta decodificar, se falhar remove os últimos bytes até funcionar
        while True:
            try:
                password = password_bytes.decode('utf-8')
                password_bytes = password.encode('utf-8')
                break
            except UnicodeDecodeError:
                password_bytes = password_bytes[:-1]
                if len(password_bytes) == 0:
                    raise ValueError("Não foi possível processar a senha")
    
    # Gera salt e hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha está correta"""
    try:
        plain_bytes = plain_password.encode('utf-8')
        # Se a senha exceder 72 bytes, trunca (mesma lógica do hash)
        if len(plain_bytes) > 72:
            plain_bytes = plain_bytes[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception as e:
        print(f"Erro ao verificar senha: {e}")
        return False

def get_usuario_by_id(db: Session, usuario_id: int):
    """Busca usuário por ID"""
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    """Busca usuário por email"""
    return db.query(Usuario).filter(Usuario.email == email).first()

def create_usuario(db: Session, usuario: UsuarioCreate):
    """Cria novo usuário"""
    # Valida tamanho da senha antes de processar
    senha_bytes = len(usuario.senha.encode('utf-8'))
    if senha_bytes > 72:
        raise HTTPException(
            status_code=400, 
            detail=f"Senha muito longa. Máximo permitido: 72 caracteres (recebido: aproximadamente {len(usuario.senha)} caracteres)"
        )
    
    # Verifica se já existe usuário com esse email
    db_usuario = get_usuario_by_email(db, usuario.email)
    if db_usuario:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    try:
        # Cria hash da senha
        hashed_password = get_password_hash(usuario.senha)
        
        # Cria novo usuário
        db_usuario = Usuario(
            nome=usuario.nome,
            email=usuario.email,
            senha=hashed_password
        )
        db.add(db_usuario)
        db.commit()
        db.refresh(db_usuario)
        return db_usuario
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def update_usuario(db: Session, usuario_id: int, usuario_data: UsuarioUpdate):
    """Atualiza usuário"""
    db_usuario = get_usuario_by_id(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    try:
        update_data = usuario_data.dict(exclude_unset=True)
        
        # Se houver nova senha, valida tamanho e faz hash
        if "senha" in update_data:
            senha_bytes = len(update_data["senha"].encode('utf-8'))
            if senha_bytes > 72:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Senha muito longa. Máximo permitido: 72 caracteres"
                )
            update_data["senha"] = get_password_hash(update_data["senha"])
        
        # Se houver mudança de email, verifica se não está em uso
        if "email" in update_data and update_data["email"] != db_usuario.email:
            existing_usuario = get_usuario_by_email(db, update_data["email"])
            if existing_usuario:
                raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        for key, value in update_data.items():
            setattr(db_usuario, key, value)
        
        db.commit()
        db.refresh(db_usuario)
        return db_usuario
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def authenticate_usuario(db: Session, email: str, senha: str):
    """Autentica usuário (verifica email e senha)"""
    usuario = get_usuario_by_email(db, email)
    if not usuario:
        return None
    
    if not verify_password(senha, usuario.senha):
        return None
    
    return usuario

def delete_usuario(db: Session, usuario_id: int):
    """Deleta usuário"""
    db_usuario = get_usuario_by_id(db, usuario_id)
    if db_usuario:
        db.delete(db_usuario)
        db.commit()
        return True
    return False

