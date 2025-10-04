import React from 'react';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

export default function Stats({ stats }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Recebido</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRecebido || 0)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          +{stats.crescimentoMensal || 0}% em relação ao mês anterior
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Clientes Ativos</p>
            <p className="text-2xl font-bold text-blue-600">{stats.clientesAtivos || 0}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.novosClientes || 0} novos este mês
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Honorários Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.honorariosPendentes || 0)}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.qtdHonorariosPendentes || 0} honorários aguardando pagamento
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Taxa de Crescimento</p>
            <p className="text-2xl font-bold text-purple-600">{stats.taxaCrescimento || 0}%</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Crescimento anual
        </p>
      </div>
    </div>
  );
} 