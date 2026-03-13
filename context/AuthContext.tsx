import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, getAccessToken, apiUploadPut } from '../services/api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (formData: FormData) => Promise<void>;
    isAdmin: boolean;
    isStoreManager: boolean;
    isCustomer: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const init = async () => {
            const token = getAccessToken();
            if (token) {
                try {
                    const res = await api<User>('/users/profile');
                    setUser(res.data);
                } catch {
                    setAccessToken(null);
                }
            }
            setLoading(false);
        };
        init();

        // Listen for forced logout (expired refresh)
        const handleLogout = () => {
            setUser(null);
            setAccessToken(null);
        };
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<User> => {
        const res = await api<{ user: User; accessToken: string }>('/auth/login', {
            method: 'POST',
            body: { email, password },
            auth: false,
        });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const register = useCallback(async (email: string, password: string, name?: string) => {
        await api('/auth/register', {
            method: 'POST',
            body: { email, password, name },
            auth: false,
        });
    }, []);

    const logout = useCallback(async () => {
        try { await api('/auth/logout', { method: 'POST' }); } catch { }
        setAccessToken(null);
        setUser(null);
    }, []);

    const updateProfile = useCallback(async (formData: FormData) => {
        const res = await apiUploadPut<User>('/users/profile', formData);
        setUser(res.data);
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin: user?.role === 'admin',
        isStoreManager: user?.role === 'store_manager',
        isCustomer: user?.role === 'customer',
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
