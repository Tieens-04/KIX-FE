import api, { buildQuery } from './api';
import { Store } from '../types';

export const storeApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
        api<Store[]>(`/stores${buildQuery(params || {})}`),

    getById: (id: string) =>
        api<Store>(`/stores/${id}`, { auth: false }),

    create: (data: Partial<Store>) =>
        api<Store>('/stores', { method: 'POST', body: data }),

    update: (id: string, data: Partial<Store>) =>
        api<Store>(`/stores/${id}`, { method: 'PUT', body: data }),

    delete: (id: string) =>
        api(`/stores/${id}`, { method: 'DELETE' }),
};

export default storeApi;
