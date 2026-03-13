// Base API service - đổi VITE_API_URL trong .env để thay đổi endpoint
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

let accessToken: string | null = localStorage.getItem('kix_token');

export const setAccessToken = (token: string | null) => {
    accessToken = token;
    if (token) localStorage.setItem('kix_token', token);
    else localStorage.removeItem('kix_token');
};

export const getAccessToken = () => accessToken;

interface ApiOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    auth?: boolean;
}

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    meta?: { page: number; limit: number; totalCount: number; totalPages: number };
    error?: any;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, auth = true } = options;

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        credentials: 'include',
    };

    if (auth && accessToken) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    if (body) config.body = JSON.stringify(body);

    let response = await fetch(`${API_URL}${endpoint}`, config);

    // Auto-refresh token on 401
    if (response.status === 401 && auth && accessToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            (config.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(`${API_URL}${endpoint}`, config);
        } else {
            setAccessToken(null);
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    }

    const data = await response.json();
    if (!response.ok) throw { status: response.status, ...data };
    return data;
}

async function refreshAccessToken(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            if (data.data?.accessToken) {
                setAccessToken(data.data.accessToken);
                return true;
            }
        }
        return false;
    } catch {
        return false;
    }
}

// Helper to build query string
export function buildQuery(params: Record<string, any>): string {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const str = q.toString();
    return str ? `?${str}` : '';
}

// Upload helper - gửi FormData (multipart/form-data) thay vì JSON
export async function apiUpload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const config: RequestInit = {
        method: 'POST',
        body: formData,
        credentials: 'include',
    };

    // Không set Content-Type - browser tự thêm boundary cho multipart/form-data
    const headers: Record<string, string> = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    config.headers = headers;

    let response = await fetch(`${API_URL}${endpoint}`, config);

    // Auto-refresh token on 401
    if (response.status === 401 && accessToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            headers['Authorization'] = `Bearer ${accessToken}`;
            config.headers = headers;
            response = await fetch(`${API_URL}${endpoint}`, config);
        } else {
            setAccessToken(null);
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    }

    const data = await response.json();
    if (!response.ok) throw { status: response.status, ...data };
    return data;
}

// Upload với method PUT
export async function apiUploadPut<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const config: RequestInit = {
        method: 'PUT',
        body: formData,
        credentials: 'include',
    };

    const headers: Record<string, string> = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    config.headers = headers;

    let response = await fetch(`${API_URL}${endpoint}`, config);

    if (response.status === 401 && accessToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            headers['Authorization'] = `Bearer ${accessToken}`;
            config.headers = headers;
            response = await fetch(`${API_URL}${endpoint}`, config);
        } else {
            setAccessToken(null);
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    }

    const data = await response.json();
    if (!response.ok) throw { status: response.status, ...data };
    return data;
}

export default api;
