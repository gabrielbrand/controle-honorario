from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Honorario, Cliente, Pagamento
from sqlalchemy import func, extract, and_, desc, or_
from datetime import datetime, timedelta, date
from typing import List
from pydantic import BaseModel
from app.schemas.honorarios import Honorario as HonorarioSchema

router = APIRouter()

class DashboardStats(BaseModel):
    totalRecebido: float
    crescimentoMensal: float
    clientesAtivos: int
    novosClientes: int
    honorariosPendentes: float
    qtdHonorariosPendentes: int
    honorariosCadastrados: int

class RevenueData(BaseModel):
    month: str
    value: float

class ClientData(BaseModel):
    month: str
    active: int
    new: int

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Data atual e primeiro dia do mês atual
    hoje = datetime.now()
    primeiro_dia_mes_atual = hoje.replace(day=1)
    
    # Mês anterior
    primeiro_dia_mes_anterior = (hoje.replace(day=1) - timedelta(days=1)).replace(day=1)
    
    # Total recebido no mês atual
    total_recebido_atual = db.query(func.sum(Pagamento.valor))\
        .filter(
            and_(
                Pagamento.is_deleted == False,
                extract('year', Pagamento.data_pagamento) == hoje.year,
                extract('month', Pagamento.data_pagamento) == hoje.month
            )
        ).scalar() or 0

    # Total recebido no mês anterior
    total_recebido_anterior = db.query(func.sum(Pagamento.valor))\
        .filter(
            and_(
                Pagamento.is_deleted == False,
                extract('year', Pagamento.data_pagamento) == primeiro_dia_mes_anterior.year,
                extract('month', Pagamento.data_pagamento) == primeiro_dia_mes_anterior.month
            )
        ).scalar() or 0

    # Calcular crescimento mensal
    crescimento_mensal = 0
    if total_recebido_anterior > 0:
        crescimento_mensal = ((total_recebido_atual - total_recebido_anterior) / total_recebido_anterior) * 100

    # Clientes ativos (que têm honorários não vencidos)
    clientes_ativos = db.query(func.count(func.distinct(Cliente.id)))\
        .join(Honorario)\
        .filter(
            and_(
                Cliente.is_deleted == False,
                Honorario.is_deleted == False,
                Honorario.data_vencimento >= hoje
            )
        ).scalar() or 0

    # Novos clientes este mês
    hoje = date.today()
    primeiro_dia_mes = hoje.replace(day=1)
    novos_clientes = db.query(func.count(Cliente.id))\
        .filter(
            and_(
                Cliente.is_deleted == False,
                Cliente.data_criacao >= primeiro_dia_mes,
                Cliente.data_criacao <= hoje
            )
        ).scalar() or 0

    # Honorários pendentes (soma de PENDENTE e ATRASADO)
    honorarios_pendentes = db.query(func.sum(Honorario.valor))\
        .filter(
            and_(
                Honorario.is_deleted == False,
                or_(
                    Honorario.status_id == 1,  # PENDENTE
                    Honorario.status_id == 3   # ATRASADO
                )
            )
        ).scalar() or 0

    qtd_honorarios_pendentes = db.query(func.count(Honorario.id))\
        .filter(
            and_(
                Honorario.is_deleted == False,
                or_(
                    Honorario.status_id == 1,  # PENDENTE
                    Honorario.status_id == 3   # ATRASADO
                )
            )
        ).scalar() or 0

    # Total de honorários cadastrados
    honorarios_cadastrados = db.query(func.count(Honorario.id))\
        .filter(Honorario.is_deleted == False)\
        .scalar() or 0

    return DashboardStats(
        totalRecebido=total_recebido_atual,
        crescimentoMensal=round(crescimento_mensal, 2),
        clientesAtivos=clientes_ativos,
        novosClientes=novos_clientes,
        honorariosPendentes=honorarios_pendentes,
        qtdHonorariosPendentes=qtd_honorarios_pendentes,
        honorariosCadastrados=honorarios_cadastrados
    )

@router.get("/dashboard/revenue", response_model=List[RevenueData])
def get_revenue_data(db: Session = Depends(get_db)):
    hoje = datetime.now()
    
    # Buscar dados dos últimos 6 meses
    dados = []
    for i in range(5, -1, -1):
        data = hoje - timedelta(days=30*i)
        total = db.query(func.sum(Pagamento.valor))\
            .filter(
                and_(
                    Pagamento.is_deleted == False,
                    extract('year', Pagamento.data_pagamento) == data.year,
                    extract('month', Pagamento.data_pagamento) == data.month
                )
            ).scalar() or 0
            
        dados.append(RevenueData(
            month=data.strftime("%b/%Y"),
            value=total
        ))
    
    return dados

@router.get("/dashboard/clients", response_model=List[ClientData])
def get_client_data(db: Session = Depends(get_db)):
    hoje = datetime.now()
    
    # Buscar dados dos últimos 6 meses
    dados = []
    for i in range(5, -1, -1):
        data = hoje - timedelta(days=30*i)
        primeiro_dia = data.replace(day=1)
        ultimo_dia = (primeiro_dia + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        # Clientes ativos no mês
        ativos = db.query(func.count(func.distinct(Cliente.id)))\
            .join(Honorario)\
            .filter(
                and_(
                    Cliente.is_deleted == False,
                    Honorario.is_deleted == False,
                    extract('year', Honorario.data_vencimento) == data.year,
                    extract('month', Honorario.data_vencimento) == data.month
                )
            ).scalar() or 0
            
        # Novos clientes no mês
        novos = db.query(func.count(Cliente.id))\
            .filter(
                and_(
                    Cliente.is_deleted == False,
                    Cliente.data_criacao >= primeiro_dia,
                    Cliente.data_criacao <= ultimo_dia
                )
            ).scalar() or 0
            
        dados.append(ClientData(
            month=data.strftime("%b/%Y"),
            active=ativos,
            new=novos
        ))
    
    return dados

@router.get("/dashboard/recent-honorarios", response_model=List[HonorarioSchema])
def get_recent_honorarios(db: Session = Depends(get_db)):
    """
    Retorna os 5 honorários mais recentes não deletados para exibição no dashboard.
    """
    return db.query(Honorario)\
        .options(
            joinedload(Honorario.cliente),
            joinedload(Honorario.status)
        )\
        .filter(Honorario.is_deleted == False)\
        .order_by(desc(Honorario.data_criacao))\
        .limit(5)\
        .all() 