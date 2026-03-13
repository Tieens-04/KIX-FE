import api, { buildQuery } from './api';
import { Promotion, PromoValidationResult } from '../types';

export const promotionApi = {
    // Customer: validate promo code
    validate: (code: string) =>
        api<PromoValidationResult>('/promotions/validate', {
            method: 'POST',
            body: { code },
        }),

    // Admin CRUD
    getAll: (params?: { page?: number; limit?: number; search?: string; is_active?: string }) =>
        api<Promotion[]>(`/promotions${buildQuery(params || {})}`),

    getById: (id: string) =>
        api<Promotion>(`/promotions/${id}`),

    create: (data: Partial<Promotion>) =>
        api<Promotion>('/promotions', { method: 'POST', body: data }),

    update: (id: string, data: Partial<Promotion>) =>
        api<Promotion>(`/promotions/${id}`, { method: 'PUT', body: data }),

    delete: (id: string) =>
        api<void>(`/promotions/${id}`, { method: 'DELETE' }),
};

export default promotionApi;
