import api, { buildQuery, apiUploadPut } from './api';
import { User } from '../types';

export const userApi = {
    getProfile: () =>
        api<User>('/users/profile'),

    updateProfile: (formData: FormData) =>
        apiUploadPut<User>('/users/profile', formData),

    // Admin only
    getAll: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
        api<User[]>(`/users${buildQuery(params || {})}`),

    updateRole: (userId: string, role: string) =>
        api<User>(`/users/${userId}/role`, { method: 'PUT', body: { role } }),
};

export default userApi;
