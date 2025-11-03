import { apiFetch } from '@/utils/api';

export async function buscarClientes() {
  try {
    const response = await apiFetch('/clientes/');

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