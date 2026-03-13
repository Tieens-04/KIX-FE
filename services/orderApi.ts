import api, { buildQuery } from './api';
import { Order, Address } from '../types';

export const orderApi = {
    checkout: (data: { shipping_address: Address; payment_method?: string }) =>
        api<Order>('/orders/checkout', { method: 'POST', body: data }),

    getMyOrders: (params?: { page?: number; limit?: number; status?: string }) =>
        api<Order[]>(`/orders${buildQuery(params || {})}`),

    getById: (id: string) =>
        api<Order>(`/orders/${id}`),

    cancel: (id: string) =>
        api<Order>(`/orders/${id}/cancel`, { method: 'PUT' }),

    // Admin / Store Manager
    getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
        api<Order[]>(`/orders/admin/all${buildQuery(params || {})}`),

    updateStatus: (id: string, status: string) =>
        api<Order>(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
};

export default orderApi;
