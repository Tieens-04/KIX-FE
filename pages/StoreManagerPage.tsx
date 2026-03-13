import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { navigateWithTransition } from '../components/PageTransition';
import { pageTransition } from '../utils/animations';
import { useAuth } from '../context/AuthContext';
import { storeApi } from '../services/storeApi';
import { inventoryApi } from '../services/inventoryApi';
import { orderApi } from '../services/orderApi';
import { Store, Order } from '../types';

// ======= MAIN STORE MANAGER PAGE =======
const StoreManagerPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [inventory, setInventory] = useState<any[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
    const [loading, setLoading] = useState(true);


    // Load stores
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await storeApi.getAll({ limit: 50 });
                setStores(res.data || []);
                if (res.data?.length > 0) setSelectedStore(res.data[0]._id || res.data[0].id);
            } catch (err) { console.error(err); }
        };
        fetch();
    }, []);

    // Load inventory when store changes
    useEffect(() => {
        if (!selectedStore) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await inventoryApi.getByStore(selectedStore, { limit: 50 });
                setInventory(res.data || []);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, [selectedStore]);

    // Load orders
    useEffect(() => {
        if (activeTab !== 'orders') return;
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await orderApi.getAll({ limit: 20 });
                setOrders(res.data || []);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, [activeTab]);

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await orderApi.updateStatus(orderId, status);
            const res = await orderApi.getAll({ limit: 20 });
            setOrders(res.data || []);
        } catch (err: any) {
            alert(err?.message || 'Lỗi');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigateWithTransition('/login');
    };

    const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);



    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <div className="min-h-screen flex flex-col lg:flex-row bg-background-light">
                {/* Sidebar */}
                <aside className="w-full lg:w-72 bg-white border-b lg:border-r border-border-light flex flex-col z-50">
                    <div className="p-8 flex items-center gap-3">
                        <motion.div
                            className="size-10 bg-blue-500 rounded-xl flex items-center justify-center text-white"
                            style={{ boxShadow: '6px 6px 0px #111811' }}
                            whileHover={{ rotate: 6, scale: 1.05 }}
                        >
                            <span className="material-symbols-outlined font-black">store</span>
                        </motion.div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic">Store Manager</h2>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-4">Management</p>
                        {[
                            { icon: 'inventory_2', label: 'Inventory', tab: 'inventory' as const },
                            { icon: 'receipt_long', label: 'Orders', tab: 'orders' as const },
                        ].map((item) => (
                            <motion.button
                                key={item.tab}
                                onClick={() => setActiveTab(item.tab)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold uppercase tracking-tight text-sm transition-all ${activeTab === item.tab
                                    ? 'bg-blue-500 text-white font-black italic'
                                    : 'text-charcoal/60 hover:text-charcoal hover:bg-gray-100'
                                    }`}
                                whileHover={{ x: 4 }}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                            </motion.button>
                        ))}

                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mt-8 mb-4">Phiếu Kho</p>
                        <motion.button
                            onClick={() => navigateWithTransition('/store-manager/stock-tickets')}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold uppercase tracking-tight text-sm text-charcoal/60 hover:text-charcoal hover:bg-gray-100 transition-all"
                            whileHover={{ x: 4 }}
                        >
                            <span className="material-symbols-outlined">description</span>
                            Stock Tickets
                        </motion.button>
                    </nav>

                    <div className="p-6 border-t border-border-light">
                        <div className="flex items-center gap-3 p-3 bg-background-alt rounded-2xl">
                            <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-tight">{user?.name || user?.email}</p>
                                <p className="text-[10px] opacity-50 uppercase font-bold">Store Manager</p>
                            </div>
                            <motion.button onClick={handleLogout} className="text-red-500 hover:text-red-700" whileHover={{ scale: 1.1 }}>
                                <span className="material-symbols-outlined text-lg">logout</span>
                            </motion.button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="flex-1 p-6 lg:p-10 bg-background-alt overflow-y-auto relative">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
                        <div className="relative z-10">
                            <header className="flex flex-wrap justify-between items-center gap-6 mb-10">
                                <div>
                                    <p className="text-blue-500 font-black tracking-[0.3em] uppercase text-xs mb-2">Dashboard</p>
                                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                                        {activeTab === 'inventory' ? 'Quản Lý Kho' : activeTab === 'orders' ? 'Đơn Hàng' : 'Quản Lý SKU'}
                                    </h1>
                                </div>
                                {activeTab === 'skus' && (
                                    <motion.button

                                        className="bg-blue-500 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-charcoal transition-all shadow-xl flex items-center gap-2"
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        Tạo SKU
                                    </motion.button>
                                )}
                            </header>

                            {/* ===== INVENTORY TAB ===== */}
                            {activeTab === 'inventory' && (
                                <>
                                    {/* Store selector */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                                        {stores.map((store) => (
                                            <motion.button
                                                key={store._id || store.id}
                                                onClick={() => setSelectedStore(store._id || store.id)}
                                                className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedStore === (store._id || store.id)
                                                    ? 'bg-blue-500 text-white border-charcoal shadow-lg'
                                                    : 'bg-white border-border-light hover:border-blue-500'
                                                    }`}
                                                whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                                            >
                                                <h3 className="font-black uppercase italic text-xs">{store.name}</h3>
                                                <p className="text-[9px] font-bold opacity-60 mt-1">{store.address}</p>
                                            </motion.button>
                                        ))}
                                    </div>

                                    {/* Inventory Table */}
                                    {loading ? (
                                        <div className="flex justify-center py-20">
                                            <motion.span className="material-symbols-outlined text-4xl text-blue-500" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                        </div>
                                    ) : inventory.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-3xl border border-border-light">
                                            <span className="material-symbols-outlined text-6xl opacity-20 mb-4">inventory_2</span>
                                            <p className="font-black uppercase tracking-widest opacity-40">Chưa có sản phẩm trong kho</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-[2rem] border border-border-light overflow-hidden shadow-xl">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-charcoal text-white">
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Sản phẩm</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">SKU</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Tồn kho</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {inventory.map((item: any) => {
                                                        const skuNode = item.sku || item.sku_id;
                                                        const productNode = item.sku?.product || item.sku_id?.product_id;
                                                        const skuId = skuNode?._id || skuNode?.id || skuNode;
                                                        return (
                                                            <tr key={item._id} className="hover:bg-blue-50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <p className="font-black italic uppercase text-sm">{productNode?.name || 'Unknown'}</p>
                                                                    <p className="text-[9px] font-bold opacity-40">{skuNode?.color} / Size {skuNode?.size}</p>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-xs font-mono font-bold opacity-60">{skuNode?.sku_code || 'N/A'}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                            <div className={`h-full ${item.quantity > 10 ? 'bg-primary' : item.quantity > 0 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${Math.min(item.quantity, 100)}%` }}></div>
                                                                        </div>
                                                                        <span className={`text-sm font-black ${item.quantity === 0 ? 'text-red-500' : item.quantity <= 10 ? 'text-orange-500' : ''}`}>{item.quantity}</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ===== ORDERS TAB ===== */}
                            {activeTab === 'orders' && (
                                <>
                                    {loading ? (
                                        <div className="flex justify-center py-20">
                                            <motion.span className="material-symbols-outlined text-4xl text-blue-500" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-3xl border border-border-light">
                                            <span className="material-symbols-outlined text-6xl opacity-20 mb-4">receipt_long</span>
                                            <p className="font-black uppercase tracking-widest opacity-40">Chưa có đơn hàng</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-[2rem] border border-border-light overflow-hidden shadow-xl">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-charcoal text-white">
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Mã đơn</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Email</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Tổng</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {orders.map((order) => {
                                                        const oid = order._id || order.id;
                                                        const transitions: Record<string, string[]> = { pending: ['paid', 'cancelled'], paid: ['completed', 'cancelled'] };
                                                        const available = transitions[order.status] || [];
                                                        return (
                                                            <tr key={oid} className="hover:bg-blue-50 transition-colors">
                                                                <td className="px-6 py-4 font-black italic text-sm">{order.order_number}</td>
                                                                <td className="px-6 py-4 text-xs font-bold">{order.customer_email || 'N/A'}</td>
                                                                <td className="px-6 py-4 font-black text-blue-500">{formatPrice(order.total)}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'paid' ? 'bg-blue-100 text-blue-700' : order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex gap-2">
                                                                        {available.map((s) => (
                                                                            <motion.button key={s} onClick={() => handleUpdateOrderStatus(oid, s)}
                                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${s === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}
                                                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                            >
                                                                                → {s}
                                                                            </motion.button>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                    </div>

                    <footer className="bg-white border-t-8 border-blue-500 py-6 px-10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-md">
                                <span className="material-symbols-outlined text-xl font-black">store</span>
                            </div>
                            <h2 className="text-lg font-black tracking-tighter uppercase italic">Store Manager</h2>
                        </div>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">© 2024 KIX Lab</p>
                    </footer>
                </main>
            </div>

        </motion.div>
    );
};

export default StoreManagerPage;
