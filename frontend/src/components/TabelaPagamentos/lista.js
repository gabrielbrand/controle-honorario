import { apiFetch, apiGet, apiPost, apiPut, apiPatch } from '@/utils/api';

export async function buscarPagamentos() {
  try {
    const response = await apiFetch('/pagamentos/');
    if (!response.ok) {
      throw new Error('Erro ao buscar pagamentos');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    throw error;
  }
}

export async function buscarTiposPagamento() {
  try {
    const data = await apiGet('/tipos-pagamento/');
    return data;
  } catch (error) {
    console.error('Erro ao buscar tipos de pagamento:', error);
    throw error;
  }
}

export async function salvarPagamento(formData, selectedPagamento = null) {
  const url = selectedPagamento 
    ? `/pagamentos/${selectedPagamento.id}`
    : '/pagamentos/';

  try {
    const result = selectedPagamento 
      ? await apiPut(url, formData)
      : await apiPost(url, formData);

    await atualizarStatusHonorario(formData.honorario_id);

    return result;
  } catch (error) {
    const errorMessage = error.detail || error.message || 'Erro ao salvar pagamento';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
}

export async function atualizarStatusHonorario(honorarioId) {
  try {
    const result = await apiPut(`/honorarios/${honorarioId}`, {
      status_id: 2
    });
    return result;
  } catch (error) {
    throw new Error('Erro ao atualizar status do honorário');
  }
}

export async function excluirPagamento(pagamentoId) {
  try {
    const result = await apiPatch(`/pagamentos/${pagamentoId}/soft-delete`, { 
      is_deleted: true 
    });
    return result;
  } catch (error) {
    const errorMessage = error.detail || 'Erro ao excluir pagamento';
    throw new Error(errorMessage);
  }
}