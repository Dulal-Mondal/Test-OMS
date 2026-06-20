const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
}

export const api = {
    // Orders
    listOrders: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/orders${qs ? `?${qs}` : ''}`);
    },
    getOrder: (id) => request(`/orders/${id}`),
    createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id, status, notes) => request(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
    deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
    pullFromSBC: () => request('/orders/pull', { method: 'POST' }),
};