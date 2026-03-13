import api, { buildQuery } from './api';
import { Inventory, InventoryHistory } from '../types';

export const inventoryApi = {
    getByStore: (storeId: string, params?: { page?: number; limit?: number }) =>
        api<Inventory[]>(`/inventory/store/${storeId}${buildQuery(params || {})}`),

    getBySku: (skuId: string) =>
        api<Inventory[]>(`/inventory/sku/${skuId}`),

    update: (storeId: string, skuId: string, data: { quantity: number; note?: string }) =>
        api<Inventory>(`/inventory/store/${storeId}/sku/${skuId}`, { method: 'PUT', body: data }),

    getHistory: (params?: { store_id?: string; sku_id?: string; page?: number; limit?: number }) =>
        api<InventoryHistory[]>(`/inventory/history${buildQuery(params || {})}`),
};

export default inventoryApi;
