import api from './api';
import { Color } from '../types';

export const colorApi = {
    getAll: () =>
        api<Color[]>('/colors', { auth: false }),

    create: (data: { name: string; code: string; slug?: string }) =>
        api<Color>('/colors', { method: 'POST', body: data }),

    update: (id: string, data: Partial<Color>) =>
        api<Color>(`/colors/${id}`, { method: 'PUT', body: data }),

    delete: (id: string) =>
        api(`/colors/${id}`, { method: 'DELETE' }),
};

export default colorApi;
