import api from './api';
import { Cart } from '../types';

export const cartApi = {
    get: () =>
        api<Cart>('/cart'),

    addItem: (data: { product_id: string; sku_id?: string; store_id?: string; quantity: number; price?: number }) =>
        api<Cart>('/cart/items', { method: 'POST', body: data }),

    updateItem: (itemId: string, quantity: number) =>
        api<Cart>(`/cart/items/${itemId}`, { method: 'PUT', body: { quantity } }),

    removeItem: (itemId: string) =>
        api<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' }),

    clear: () =>
        api('/cart', { method: 'DELETE' }),
};

export default cartApi;
