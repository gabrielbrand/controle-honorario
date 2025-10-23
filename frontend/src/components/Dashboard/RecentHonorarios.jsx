import React from 'react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RecentHonorarios({ honorarios }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredAndSortedHonorarios = honorarios?.filter(honorario => {
    const status = honorario.status?.nome;
    return status === 'PENDENTE' || status === 'ATRASADO';
  }).sort((a, b) => {
    const dateA = new Date(a.data_vencimento);
    const dateB = new Date(b.data_vencimento);
    return dateA - dateB;
  }) || [];

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const colors = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      PAGO: 'bg-green-100 text-green-800',
      ATRASADO: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatReferenceDate = (dateString) => {
    try {
      const date = parse(dateString, 'yyyy-MM', new Date());
      return format(date, 'MMM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatDueDate = (dateString) => {
    try {
      if (!dateString) return 'Data inválida';
      
      // Se a data vier como string no formato ISO (YYYY-MM-DD)
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-6">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Honorários Pendentes de Pagamento</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Valor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vencimento</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Referência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedHonorarios?.map((honorario) => (
                <tr key={honorario.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {honorario.cliente?.nome}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{formatCurrency(honorario.valor)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {formatDueDate(honorario.data_vencimento)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(honorario.status?.nome)}`}>
                      {honorario.status?.nome || 'PENDENTE'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {formatReferenceDate(honorario.mes_referencia)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 