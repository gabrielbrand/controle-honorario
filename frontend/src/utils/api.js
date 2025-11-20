/**
 * Helper para fazer requisições à API com autenticação automática
 */

export const apiFetch = async (url, options = {}) => {
    // Obtém usuário do localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Prepara headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    // Adiciona user-id se usuário estiver logado
    if (user && user.id) {
        headers['user-id'] = user.id.toString();
    }
    
    // Faz a requisição
    const response = await fetch(`http://localhost:8000${url}`, {
        ...options,
        headers,
    });
    
    return response;
};

// Helper para obter JSON diretamente
export const apiGet = async (url, options = {}) => {
    const response = await apiFetch(url, { ...options, method: 'GET' });
    const data = await response.json();
    if (!response.ok) {
        throw data;
    }
    return data;
};

// Helper para POST
export const apiPost = async (url, data, options = {}) => {
    const response = await apiFetch(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw result;
    }
    return result;
};

// Helper para PUT
export const apiPut = async (url, data, options = {}) => {
    const response = await apiFetch(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw result;
    }
    return result;
};

// Helper para PATCH
export const apiPatch = async (url, data, options = {}) => {
    const response = await apiFetch(url, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw result;
    }
    return result;
};

// Helper para DELETE
export const apiDelete = async (url, options = {}) => {
    const response = await apiFetch(url, { ...options, method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
        throw data;
    }
    return data;
};

