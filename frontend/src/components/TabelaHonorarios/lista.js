export async function buscarCliente(clienteId) {
  const response = await fetch(`http://localhost:8000/clientes/${clienteId}`);
  if (!response.ok) {
    console.error('Erro ao buscar cliente:', clienteId);
    return null;
  }
  return await response.json();
}

export async function buscarContador(contadorId) {
  const response = await fetch(`http://localhost:8000/contadores/${contadorId}`);
  if (!response.ok) {
    console.error('Erro ao buscar contador:', contadorId);
    return null;
  }
  return await response.json();
}

export async function buscarStatus(statusId) {
  const response = await fetch(`http://localhost:8000/status/${statusId}`);
  if (!response.ok) {
    console.error('Erro ao buscar status:', statusId);
    return null;
  }
  return await response.json();
}

function ajustarData(dataString) {
  if (!dataString) return new Date();
  
  // Cria a data sem ajustes de fuso horário
  // Adiciona 'T00:00:00' para garantir que seja interpretada como data local
  const data = new Date(dataString + 'T00:00:00');
  return data;
}

export async function buscarHonorarios() {
  try {
    const response = await fetch('http://localhost:8000/honorarios/');
    if (!response.ok) {
      throw new Error('Erro ao buscar honorários');
    }
    const data = await response.json();
    
    // Buscar dados dos clientes, contadores e status para cada honorário
    const honorariosCompletos = await Promise.all(
      data.map(async (honorario) => {
        const [cliente, contador, status] = await Promise.all([
          buscarCliente(honorario.cliente_id),
          buscarContador(honorario.contador_id),
          buscarStatus(honorario.status_id)
        ]);

        // Garantir que mes_referencia seja uma string válida
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
          cliente: cliente || {
            nome: 'Cliente não informado',
            email: 'Email não informado',
            telefone: 'Telefone não informado'
          },
          contador: contador || {
            nome: 'Contador não informado',
            email: 'Email não informado',
            telefone: 'Telefone não informado'
          },
          status: status || {
            nome: 'Status não informado',
            cor: 'gray'
          }
        };
      })
    );
    
    return honorariosCompletos;
  } catch (error) {
    console.error('Erro ao buscar honorários:', error);
    throw error;
  }
}