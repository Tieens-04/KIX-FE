import api, { buildQuery, apiUpload, apiUploadPut } from './api';
import { Store } from '../types';

export const storeApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
        api<Store[]>(`/stores${buildQuery(params || {})}`),

    getById: (id: string) =>
        api<Store>(`/stores/${id}`, { auth: false }),

    create: (data: Partial<Store>) =>
        api<Store>('/stores', { method: 'POST', body: data }),

    createWithImage: (formData: FormData) =>
        apiUpload<Store>('/stores', formData),

    update: (id: string, data: Partial<Store>) =>
        api<Store>(`/stores/${id}`, { method: 'PUT', body: data }),

    updateWithImage: (id: string, formData: FormData) =>
        apiUploadPut<Store>(`/stores/${id}`, formData),

    delete: (id: string) =>
        api(`/stores/${id}`, { method: 'DELETE' }),
};

export default storeApi;
