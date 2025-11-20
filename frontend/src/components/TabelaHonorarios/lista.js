import { apiFetch } from '@/utils/api';

function ajustarData(dataString) {
  if (!dataString) return new Date();
  
  const data = new Date(dataString + 'T00:00:00');
  return data;
}

export async function buscarHonorarios() {
  try {
    const response = await apiFetch('/honorarios/');
    if (!response.ok) {
      throw new Error('Erro ao buscar honorários');
    }
    const data = await response.json();
    
    const honorariosCompletos = data.map((honorario) => {
      let mesReferencia = honorario.mes_referencia;
      if (!mesReferencia) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        mesReferencia = `${ano}-${mes}`;
      }

      return {
        ...honorario,
        dataVencimento: ajustarData(honorario.data_vencimento),
        valor: honorario.valor || 0,
        descricao: honorario.descricao || '',
        mes_referencia: mesReferencia,
        cliente: honorario.cliente || {
          nome: 'Cliente não informado',
          email: 'Email não informado',
          telefone: 'Telefone não informado'
        },
        status: honorario.status || {
          nome: 'Status não informado',
          cor: 'gray'
        }
      };
    });
    
    return honorariosCompletos;
  } catch (error) {
    console.error('Erro ao buscar honorários:', error);
    throw error;
  }
}