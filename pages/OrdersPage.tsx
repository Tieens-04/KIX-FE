import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { pageTransition, fadeInUp, staggerContainer, staggerItem } from '../utils/animations';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/orderApi';
import { Order } from '../types';
import { formatPrice } from '../utils/formatPrice';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'schedule' },
    paid: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'paid' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: 'check_circle' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: 'cancel' },
};

const OrdersPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cancellingId, setCancellingId] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        setIsDarkMode(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        document.documentElement.classList.toggle('light', !isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderApi.getMyOrders({ page, limit: 10, status: statusFilter || undefined });
            setOrders(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err: any) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, [page, statusFilter]);

    const handleCancel = async (id: string) => {
        if (!confirm('Bạn chắc chắn muốn hủy đơn hàng?')) return;
        setCancellingId(id);
        try {
            await orderApi.cancel(id);
            setToast('Đã hủy đơn hàng');
            setTimeout(() => setToast(''), 3000);
            fetchOrders();
        } catch (err: any) {
            setToast(err?.message || 'Không thể hủy đơn hàng');
            setTimeout(() => setToast(''), 3000);
        }
        setCancellingId('');
    };

    const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <motion.div className="min-h-screen bg-background-light dark:bg-background-dark" initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleAISearch={(e) => e?.preventDefault()} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

            {toast && <div className="fixed bottom-8 right-8 z-50 bg-primary text-charcoal px-6 py-4 rounded-full font-black text-sm shadow-xl">{toast}</div>}

            <main className="pt-24 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto">
                <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-10">
                    <div className="flex items-center gap-6">
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Đơn Hàng</h1>
                        <div className="h-[2px] flex-1 bg-charcoal/10 dark:bg-white/10"></div>
                    </div>
                </motion.div>

                {/* Status Filter */}
                <div className="flex items-center gap-2 mb-8 flex-wrap">
                    {['', 'pending', 'paid', 'completed', 'cancelled'].map((s) => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-primary text-charcoal' : 'bg-gray-100 dark:bg-charcoal hover:bg-primary/20'}`}
                        >
                            {s || 'Tất cả'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <motion.span className="material-symbols-outlined text-4xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl opacity-20 mb-4">receipt_long</span>
                        <p className="text-lg font-black uppercase tracking-widest opacity-40">Chưa có đơn hàng</p>
                    </div>
                ) : (
                    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
                        {orders.map((order, i) => {
                            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            return (
                                <motion.div key={order._id || order.id} className="bg-white dark:bg-card-dark rounded-[2rem] border border-border-light dark:border-border-dark p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow" variants={staggerItem}>
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Mã đơn</p>
                                            <p className="text-xl font-black italic">{order.order_number}</p>
                                            <p className="text-[10px] font-bold opacity-40 mt-1">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.text} flex items-center gap-1`}>
                                                <span className="material-symbols-outlined text-sm">{sc.icon}</span>
                                                {order.status}
                                            </span>
                                            {order.status === 'pending' && (
                                                <motion.button
                                                    onClick={() => handleCancel(order._id || order.id)}
                                                    disabled={cancellingId === (order._id || order.id)}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                >
                                                    Hủy đơn
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-3 mb-6">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-border-dark last:border-0">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-14 bg-background-alt dark:bg-charcoal rounded-2xl flex items-center justify-center overflow-hidden">
                                                        <span className="material-symbols-outlined text-2xl opacity-30">steps</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase italic">{item.product_name || item.product_id?.name || `SP #${idx + 1}`}</p>
                                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                                                            {item.color && `${item.color}`}{item.size ? ` • Size ${item.size}` : ''}{item.sku_code ? ` • ${item.sku_code}` : ''}
                                                        </p>
                                                        <p className="text-[10px] font-bold opacity-40">x{item.quantity} • {item.store_name && `Tại ${item.store_name}`}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-primary">{formatPrice(item.subtotal || item.price * item.quantity)}</p>
                                                    <p className="text-[9px] font-bold opacity-30">{formatPrice(item.price)}/đôi</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total & Address */}
                                    <div className="flex flex-wrap justify-between items-end gap-4 pt-4 border-t border-gray-100 dark:border-border-dark">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Giao đến</p>
                                            <p className="text-xs font-black">{order.shipping_address?.recipient_name}</p>
                                            <p className="text-xs font-bold opacity-60">{order.shipping_address?.phone}</p>
                                            <p className="text-xs font-bold opacity-60">
                                                {[
                                                    order.shipping_address?.address,
                                                    order.shipping_address?.ward,
                                                    order.shipping_address?.district,
                                                    order.shipping_address?.city,
                                                ].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Tổng tiền</p>
                                            <p className="text-2xl font-black text-primary italic">{formatPrice(order.total || 0)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-10">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-100 dark:bg-charcoal rounded-xl font-black text-xs disabled:opacity-30">Trước</button>
                        <span className="text-xs font-black">{page} / {totalPages}</span>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 bg-gray-100 dark:bg-charcoal rounded-xl font-black text-xs disabled:opacity-30">Sau</button>
                    </div>
                )}
            </main>
            <Footer />
        </motion.div>
    );
};

export default OrdersPage;
