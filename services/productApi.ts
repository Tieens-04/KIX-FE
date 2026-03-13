import api, { buildQuery, apiUpload, apiUploadPut } from './api';
import { Product, SKU } from '../types';

export const productApi = {
    getAll: (params?: { page?: number; limit?: number; brand?: string; search?: string; sort?: string; status?: string; color?: string; size?: number; minPrice?: number; maxPrice?: number }) =>
        api<Product[]>(`/products${buildQuery(params || {})}`),

    getAllAdmin: (params?: { page?: number; limit?: number; search?: string; sort?: string; status?: string }) =>
        api<Product[]>(`/products/admin${buildQuery(params || {})}`),

    getById: (id: string) =>
        api<{ product: Product; skus: SKU[]; availability: any[] }>(`/products/${id}`, { auth: false }),

    getBrands: () =>
        api<string[]>('/products/brands', { auth: false }),

    getSizes: () =>
        api<number[]>('/products/sizes', { auth: false }),

    getPriceRange: () =>
        api<{ minPrice: number; maxPrice: number }>('/products/price-range', { auth: false }),

    getSkus: (productId: string) =>
        api<SKU[]>(`/products/${productId}/skus`, { auth: false }),

    create: (formData: FormData) =>
        apiUpload<Product>('/products', formData),

    update: (id: string, formData: FormData) =>
        apiUploadPut<Product>(`/products/${id}`, formData),

    delete: (id: string) =>
        api(`/products/${id}`, { method: 'DELETE' }),

    createSku: (productId: string, data: Partial<SKU>) =>
        api<SKU>(`/products/${productId}/skus`, { method: 'POST', body: data }),

    getReviews: (productId: string, params?: { page?: number; limit?: number }) =>
        api<any[]>(`/products/${productId}/reviews${buildQuery(params || {})}`, { auth: false }),

    addReview: (productId: string, data: { rating: number; comment: string }) =>
        api<any>(`/products/${productId}/reviews`, { method: 'POST', body: data }),

    updateReview: (productId: string, reviewId: string, data: { rating: number; comment: string }) =>
        api<any>(`/products/${productId}/reviews/${reviewId}`, { method: 'PUT', body: data }),

    deleteReview: (productId: string, reviewId: string) =>
        api(`/products/${productId}/reviews/${reviewId}`, { method: 'DELETE' }),
};

export default productApi;
