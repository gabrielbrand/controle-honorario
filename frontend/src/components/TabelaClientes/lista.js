export async function buscarClientes() {
  try {
    const response = await fetch('http://localhost:8000/clientes/');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao buscar clientes');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
}