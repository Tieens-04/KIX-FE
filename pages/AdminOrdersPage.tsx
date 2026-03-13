import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';
import { orderApi } from '../services/orderApi';
import { Order } from '../types';

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    paid: { bg: 'bg-blue-100', text: 'text-blue-700' },
    completed: { bg: 'bg-green-100', text: 'text-green-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['completed', 'cancelled'],
};

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [updatingId, setUpdatingId] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderApi.getAll({ page, limit: 15, status: statusFilter || undefined, search: searchQuery || undefined });
            setOrders(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, [page, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchOrders();
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await orderApi.updateStatus(orderId, newStatus);
            fetchOrders();
        } catch (err: any) {
            alert(err?.message || 'Không thể cập nhật');
        }
        setUpdatingId('');
    };

    const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <AdminLayout activeNav="Orders">
                <header className="flex flex-wrap justify-between items-center gap-6 mb-12">
                    <div>
                        <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">Order Management</p>
                        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">
                            Quản Lý <span className="text-primary">Đơn Hàng</span>
                        </h1>
                    </div>
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30">search</span>
                            <input
                                type="text" placeholder="Tìm mã đơn, email..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-white border border-border-light rounded-full text-xs font-bold focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </form>
                </header>

                {/* Status filter */}
                <div className="flex items-center gap-2 mb-8 flex-wrap">
                    {['', 'pending', 'paid', 'completed', 'cancelled'].map((s) => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-primary text-charcoal' : 'bg-white border border-border-light hover:bg-primary/10'}`}
                        >
                            {s || 'Tất cả'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <motion.span className="material-symbols-outlined text-4xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-border-light overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-charcoal text-white">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Mã đơn</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Khách hàng</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Items</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Tổng</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Ngày</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => {
                                        const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                        const transitions = VALID_TRANSITIONS[order.status] || [];
                                        const oid = order._id || order.id;
                                        return (
                                            <tr key={oid} className="hover:bg-primary/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-black italic text-sm">{order.order_number}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-black">{order.customer_email || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-black">{order.items?.length || 0} items</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-black text-primary">{formatPrice(order.total)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold opacity-50">{formatDate(order.createdAt)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.text}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {transitions.length > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            {transitions.map((t) => (
                                                                <motion.button
                                                                    key={t}
                                                                    onClick={() => handleUpdateStatus(oid, t)}
                                                                    disabled={updatingId === oid}
                                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${t === 'cancelled' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-primary/10 text-charcoal hover:bg-primary'}`}
                                                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                >
                                                                    → {t}
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8 pb-10">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 bg-white border border-border-light rounded-xl font-black text-xs disabled:opacity-30">Trước</button>
                        <span className="text-xs font-black">{page} / {totalPages}</span>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white border border-border-light rounded-xl font-black text-xs disabled:opacity-30">Sau</button>
                    </div>
                )}
            </AdminLayout>
        </motion.div>
    );
};

export default AdminOrdersPage;
