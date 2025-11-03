from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.dependencies import get_usuario_id
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
def get_dashboard_stats(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    hoje = datetime.now()
    primeiro_dia_mes_atual = hoje.replace(day=1)
    
    primeiro_dia_mes_anterior = (hoje.replace(day=1) - timedelta(days=1)).replace(day=1)
    
    total_recebido_atual = db.query(func.sum(Pagamento.valor))\
        .filter(
            and_(
                Pagamento.usuario_id == usuario_id,
                Pagamento.is_deleted == False,
                extract('year', Pagamento.data_pagamento) == hoje.year,
                extract('month', Pagamento.data_pagamento) == hoje.month
            )
        ).scalar() or 0

    total_recebido_anterior = db.query(func.sum(Pagamento.valor))\
        .filter(
            and_(
                Pagamento.usuario_id == usuario_id,
                Pagamento.is_deleted == False,
                extract('year', Pagamento.data_pagamento) == primeiro_dia_mes_anterior.year,
                extract('month', Pagamento.data_pagamento) == primeiro_dia_mes_anterior.month
            )
        ).scalar() or 0

    crescimento_mensal = 0
    if total_recebido_anterior > 0:
        crescimento_mensal = ((total_recebido_atual - total_recebido_anterior) / total_recebido_anterior) * 100

    clientes_ativos = db.query(func.count(func.distinct(Cliente.id)))\
        .join(Honorario)\
        .filter(
            and_(
                Cliente.usuario_id == usuario_id,
                Honorario.usuario_id == usuario_id,
                Cliente.is_deleted == False,
                Honorario.is_deleted == False,
                Honorario.data_vencimento >= hoje
            )
        ).scalar() or 0

    hoje = date.today()
    primeiro_dia_mes = hoje.replace(day=1)
    novos_clientes = db.query(func.count(Cliente.id))\
        .filter(
            and_(
                Cliente.usuario_id == usuario_id,
                Cliente.is_deleted == False,
                Cliente.data_criacao >= primeiro_dia_mes,
                Cliente.data_criacao <= hoje
            )
        ).scalar() or 0

    honorarios_pendentes = db.query(func.sum(Honorario.valor))\
        .filter(
            and_(
                Honorario.usuario_id == usuario_id,
                Honorario.is_deleted == False,
                or_(
                    Honorario.status_id == 1,
                    Honorario.status_id == 3
                )
            )
        ).scalar() or 0

    qtd_honorarios_pendentes = db.query(func.count(Honorario.id))\
        .filter(
            and_(
                Honorario.usuario_id == usuario_id,
                Honorario.is_deleted == False,
                or_(
                    Honorario.status_id == 1,
                    Honorario.status_id == 3
                )
            )
        ).scalar() or 0

    honorarios_cadastrados = db.query(func.count(Honorario.id))\
        .filter(
            and_(
                Honorario.usuario_id == usuario_id,
                Honorario.is_deleted == False
            )
        ).scalar() or 0

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
def get_revenue_data(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    hoje = datetime.now()
    
    dados = []
    for i in range(5, -1, -1):
        # Calcular o mês corretamente: primeiro dia do mês atual menos i meses
        primeiro_dia_mes_atual = hoje.replace(day=1)
        # Subtrair i meses
        ano = primeiro_dia_mes_atual.year
        mes = primeiro_dia_mes_atual.month - i
        
        # Ajustar se o mês ficou negativo ou zero
        while mes <= 0:
            mes += 12
            ano -= 1
        
        # Calcular primeiro e último dia do mês para filtrar corretamente
        primeiro_dia = primeiro_dia_mes_atual.replace(year=ano, month=mes, day=1)
        if mes == 12:
            ultimo_dia = primeiro_dia.replace(year=ano + 1, month=1, day=1) - timedelta(days=1)
        else:
            ultimo_dia = primeiro_dia.replace(month=mes + 1, day=1) - timedelta(days=1)
        
        # Converter para date para comparar com data_pagamento (que é do tipo Date)
        primeiro_dia_date = primeiro_dia.date()
        ultimo_dia_date = ultimo_dia.date()
        
        total = db.query(func.sum(Pagamento.valor))\
            .filter(
                and_(
                    Pagamento.usuario_id == usuario_id,
                    Pagamento.is_deleted == False,
                    Pagamento.data_pagamento >= primeiro_dia_date,
                    Pagamento.data_pagamento <= ultimo_dia_date
                )
            ).scalar() or 0
            
        dados.append(RevenueData(
            month=primeiro_dia.strftime("%b/%Y"),
            value=total
        ))
    
    return dados

@router.get("/dashboard/clients", response_model=List[ClientData])
def get_client_data(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    hoje = datetime.now()
    
    dados = []
    for i in range(5, -1, -1):
        # Calcular o mês corretamente: primeiro dia do mês atual menos i meses
        primeiro_dia_mes_atual = hoje.replace(day=1)
        # Subtrair i meses
        ano = primeiro_dia_mes_atual.year
        mes = primeiro_dia_mes_atual.month - i
        
        # Ajustar se o mês ficou negativo ou zero
        while mes <= 0:
            mes += 12
            ano -= 1
        
        # Calcular primeiro e último dia do mês para filtrar corretamente
        primeiro_dia = primeiro_dia_mes_atual.replace(year=ano, month=mes, day=1)
        if mes == 12:
            ultimo_dia = primeiro_dia.replace(year=ano + 1, month=1, day=1) - timedelta(days=1)
        else:
            ultimo_dia = primeiro_dia.replace(month=mes + 1, day=1) - timedelta(days=1)
        
        # Converter para date para comparar
        primeiro_dia_date = primeiro_dia.date()
        ultimo_dia_date = ultimo_dia.date()
        
        # Clientes ativos: total de clientes distintos que têm honorários criados no mês especificado
        # Usa mes_referencia no formato YYYY-MM para determinar o mês de criação
        mes_referencia_str = f"{ano}-{str(mes).zfill(2)}"
        ativos = db.query(func.count(func.distinct(Cliente.id)))\
            .join(Honorario)\
            .filter(
                and_(
                    Cliente.usuario_id == usuario_id,
                    Honorario.usuario_id == usuario_id,
                    Cliente.is_deleted == False,
                    Honorario.is_deleted == False,
                    Honorario.mes_referencia == mes_referencia_str
                )
            ).scalar() or 0
            
        # Novos clientes: clientes criados no mês especificado
        novos = db.query(func.count(Cliente.id))\
            .filter(
                and_(
                    Cliente.usuario_id == usuario_id,
                    Cliente.is_deleted == False,
                    Cliente.data_criacao >= primeiro_dia_date,
                    Cliente.data_criacao <= ultimo_dia_date
                )
            ).scalar() or 0
            
        dados.append(ClientData(
            month=primeiro_dia.strftime("%b/%Y"),
            active=ativos,
            new=novos
        ))
    
    return dados

@router.get("/dashboard/recent-honorarios", response_model=List[HonorarioSchema])
def get_recent_honorarios(
    db: Session = Depends(get_db),
    usuario_id: int = Depends(get_usuario_id)
):
    """
    Retorna os 5 honorários pendentes ou atrasados mais próximos de vencer para exibição no dashboard.
    """
    hoje = datetime.now().date()
    
    honorarios = db.query(Honorario)\
        .options(
            joinedload(Honorario.cliente),
            joinedload(Honorario.status)
        )\
        .filter(
            and_(
                Honorario.usuario_id == usuario_id,
                Honorario.is_deleted == False,
                or_(
                    Honorario.status_id == 1,
                    Honorario.status_id == 3
                )
            )
        )\
        .order_by(Honorario.data_vencimento)\
        .limit(5)\
        .all()
    
    return honorarios 