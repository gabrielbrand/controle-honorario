export async function buscarPagamentos() {
  try {
    const response = await fetch('http://localhost:8000/pagamentos/');
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
    const response = await fetch('http://localhost:8000/tipos-pagamento/');
    if (!response.ok) throw new Error('Erro ao buscar tipos de pagamento');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar tipos de pagamento:', error);
    throw error;
  }
}

export async function salvarPagamento(formData, selectedPagamento = null) {
  const url = selectedPagamento 
    ? `http://localhost:8000/pagamentos/${selectedPagamento.id}`
    : 'http://localhost:8000/pagamentos/';
  
  const method = selectedPagamento ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  if (!response.ok) {
    if (result.detail) {
      throw new Error(typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail));
    }
    throw new Error('Erro ao salvar pagamento');
  }

  // Atualiza o status do honorário para PAGO
  await atualizarStatusHonorario(formData.honorario_id);

  return result;
}

export async function atualizarStatusHonorario(honorarioId) {
  const response = await fetch(`http://localhost:8000/honorarios/${honorarioId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status_id: 2 // ID do status PAGO
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar status do honorário');
  }

  return await response.json();
}

export async function excluirPagamento(pagamentoId) {
  const response = await fetch(`http://localhost:8000/pagamentos/${pagamentoId}/soft-delete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_deleted: true })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao excluir pagamento');
  }

  return await response.json();
}