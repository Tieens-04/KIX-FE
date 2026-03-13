import React from 'react';
import Homepage from '../pages/Homepage';
import SneakersPage from '../pages/SneakersPage';
import SneakerDetailPage from '../pages/SneakerDetailPage';
import ChatBoxPage from '../pages/ChatBoxPage';
import StoresPage from '../pages/StoresPage';
import StudioPage from '../pages/StudioPage';
import CartPage from '../pages/CartPage';
import PaymentPage from '../pages/PaymentPage';
import PaymentResultsPage from '../pages/PaymentResultsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminPage from '../pages/AdminPage';
import AdminInventoryPage from '../pages/AdminInventoryPage';
import AdminAIAssistantPage from '../pages/AdminAIAssistantPage';
import AdminCustomersPage from '../pages/AdminCustomersPage';
import AdminSettingsPage from '../pages/AdminSettingsPage';
import ProfilePage from '../pages/ProfilePage';
import OrdersPage from '../pages/OrdersPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import AdminProductsPage from '../pages/AdminProductsPage';
import StoreManagerPage from '../pages/StoreManagerPage';
import AdminStockTicketsPage from '../pages/AdminStockTicketsPage';
import StoreStockTicketsPage from '../pages/StoreStockTicketsPage';
import AdminPromotionsPage from '../pages/AdminPromotionsPage';

export interface RouteConfig {
    path: string;
    element: React.ComponentType;
    exact?: boolean;
    requireAuth?: boolean;
    roles?: string[]; // allowed roles
    paramMatch?: boolean; // if true, match path as prefix pattern like /sneakers/:id
}

export const routes: RouteConfig[] = [
    // Public
    { path: '/', element: Homepage, exact: true },
    { path: '/sneakers', element: SneakersPage, exact: true },
    { path: '/sneakers/', element: SneakerDetailPage, paramMatch: true },
    { path: '/chat', element: ChatBoxPage, exact: true },
    { path: '/stores', element: StoresPage, exact: true },
    { path: '/studio', element: StudioPage, exact: true },
    { path: '/login', element: LoginPage, exact: true },
    { path: '/register', element: RegisterPage, exact: true },

    // Customer (authenticated)
    { path: '/cart', element: CartPage, exact: true, requireAuth: true },
    { path: '/payment', element: PaymentPage, exact: true, requireAuth: true },
    { path: '/payment-result', element: PaymentResultsPage, exact: true, requireAuth: true },
    { path: '/profile', element: ProfilePage, exact: true, requireAuth: true },
    { path: '/orders', element: OrdersPage, exact: true, requireAuth: true },

    // Store Manager
    { path: '/store-manager/stock-tickets', element: StoreStockTicketsPage, exact: true, requireAuth: true, roles: ['store_manager'] },
    { path: '/store-manager', element: StoreManagerPage, exact: true, requireAuth: true, roles: ['store_manager'] },

    // Admin
    { path: '/admin/stock-tickets', element: AdminStockTicketsPage, exact: true, requireAuth: true, roles: ['admin'] },
    { path: '/admin/inventory', element: AdminInventoryPage, exact: true, requireAuth: true, roles: ['admin'] },
    { path: '/admin/analytics', element: AdminAIAssistantPage, exact: true, requireAuth: true, roles: ['admin'] },
    { path: '/admin/customers', element: AdminCustomersPage, exact: true, requireAuth: true, roles: ['admin'] },
    { path: '/admin/orders', element: AdminOrdersPage, exact: true, requireAuth: true, roles: ['admin', 'store_manager'] },
    { path: '/admin/products', element: AdminProductsPage, exact: true, requireAuth: true, roles: ['admin'] },
    { path: '/admin/promotions', element: AdminPromotionsPage, exact: true, requireAuth: true, roles: ['admin'] },
    { path: '/admin/settings', element: AdminSettingsPage, exact: true, requireAuth: true, roles: ['admin'] },
    { path: '/admin', element: AdminPage, exact: true, requireAuth: true, roles: ['admin'] },
];

export const getRouteByPath = (path: string): RouteConfig | undefined => {
    return routes.find(route => route.path === path);
};

export default routes;
