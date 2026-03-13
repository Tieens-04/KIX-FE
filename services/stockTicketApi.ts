import api, { buildQuery } from './api';

export interface StockTicketItem {
    sku_id: string;
    quantity: number;
}

export interface CreateImportTicketData {
    to_store: string;
    items: StockTicketItem[];
    note?: string;
}

export interface CreateTransferTicketData {
    from_store: string;
    to_store: string;
    items: StockTicketItem[];
    note?: string;
}

export const stockTicketApi = {
    getAll: (params?: { type?: string; status?: string; store_id?: string; page?: number; limit?: number }) =>
        api<any[]>(`/stock-tickets${buildQuery(params || {})}`),

    getById: (id: string) =>
        api<any>(`/stock-tickets/${id}`),

    createImport: (data: CreateImportTicketData) =>
        api<any>('/stock-tickets/import', { method: 'POST', body: data }),

    createTransfer: (data: CreateTransferTicketData) =>
        api<any>('/stock-tickets/transfer', { method: 'POST', body: data }),

    confirm: (id: string) =>
        api<any>(`/stock-tickets/${id}/confirm`, { method: 'PUT' }),

    cancel: (id: string) =>
        api<any>(`/stock-tickets/${id}/cancel`, { method: 'PUT' }),
};

export default stockTicketApi;
