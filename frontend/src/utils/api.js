
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (url, options = {}) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (user && user.id) {
        headers['user-id'] = user.id.toString();
    }
    
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    });
    
    return response;
};

export const apiGet = async (url, options = {}) => {
    const response = await apiFetch(url, { ...options, method: 'GET' });
    const data = await response.json();
    if (!response.ok) {
        throw data;
    }
    return data;
};

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

export const apiDelete = async (url, options = {}) => {
    const response = await apiFetch(url, { ...options, method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
        throw data;
    }
    return data;
};

