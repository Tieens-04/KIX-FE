import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';
import { storeApi } from '../services/storeApi';
import { inventoryApi } from '../services/inventoryApi';
import { Store } from '../types';
import { formatPrice } from '../utils/formatPrice';

// ======= Update Quantity Modal =======
interface UpdateQtyProps {
    item: any;
    storeId: string;
    onClose: () => void;
    onSaved: () => void;
}

const UpdateQtyModal: React.FC<UpdateQtyProps> = ({ item, storeId, onClose, onSaved }) => {
    const [qty, setQty] = useState(String(item.quantity || 0));
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const skuNode = item.sku || item.sku_id;
    const productNode = skuNode?.product || skuNode?.product_id;
    const skuId = skuNode?._id || skuNode?.id || skuNode;
    const productName = productNode?.name || 'Product';
    const skuCode = skuNode?.sku_code || '';
    const skuSize = skuNode?.size || '';
    const skuColor = skuNode?.color || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const newQty = Number(qty);
        if (isNaN(newQty) || newQty < 0) { setError('Số lượng không hợp lệ'); return; }
        setSaving(true);
        try {
            await inventoryApi.update(storeId, skuId, { quantity: newQty, note: note || undefined });
            onSaved();
        } catch (err: any) {
            setError(err?.message || 'Lỗi cập nhật');
            setSaving(false);
        }
    };

    return (
        <motion.div className="fixed inset-0 z-[100] bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md"
                initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter">
                            Cập nhật <span className="text-primary">tồn kho</span>
                        </h2>
                        <button onClick={onClose} className="size-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    {/* Product info */}
                    <div className="p-4 bg-gray-50 rounded-xl mb-5">
                        <p className="font-black uppercase text-sm">{productName}</p>
                        <p className="text-[10px] font-bold opacity-50 mt-1">
                            SKU: {skuCode} • Size {skuSize} • {skuColor}
                        </p>
                        <p className="text-[10px] font-bold opacity-40 mt-1">Hiện tại: <span className="text-primary font-black">{item.quantity}</span></p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Số lượng mới *</label>
                            <input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-black text-center focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Ghi chú</label>
                            <input value={note} onChange={(e) => setNote(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary"
                                placeholder="VD: Nhập hàng, điều chỉnh..." />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose}
                                className="flex-1 py-3 border-2 border-charcoal rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50">Hủy</button>
                            <motion.button type="submit" disabled={saving}
                                className="flex-[1.5] py-3 bg-primary text-charcoal rounded-xl font-black text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                {saving ? 'Đang lưu...' : 'Cập Nhật'}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};


// ======= MAIN PAGE =======
const AdminInventoryPage: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [inventory, setInventory] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingInv, setLoadingInv] = useState(false);

    // Modal
    const [editItem, setEditItem] = useState<any>(null);

    // Fetch stores from API
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await storeApi.getAll({ limit: 50 });
                const data = res.data || [];
                setStores(data);
                if (data.length > 0) setSelectedStore(data[0]._id || data[0].id);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchStores();
    }, []);

    // Fetch inventory when store changes
    const fetchInventory = async () => {
        if (!selectedStore) return;
        setLoadingInv(true);
        try {
            const res = await inventoryApi.getByStore(selectedStore, { limit: 200 });
            setInventory(res.data || []);
        } catch (err) { console.error(err); }
        setLoadingInv(false);
    };

    useEffect(() => { fetchInventory(); }, [selectedStore]);

    const currentStore = stores.find(s => (s._id || s.id) === selectedStore);

    // Compute stats from real data
    const totalStock = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    const totalSKUs = inventory.length;
    const lowStockCount = inventory.filter((item: any) => item.quantity > 0 && item.quantity <= 10).length;
    const soldOutCount = inventory.filter((item: any) => item.quantity === 0).length;

    // Filter by search
    const filteredInventory = inventory.filter((item: any) => {
        if (!searchQuery) return true;
        const skuNode = item.sku || item.sku_id;
        const productNode = skuNode?.product || skuNode?.product_id;
        const q = searchQuery.toLowerCase();
        const name = productNode?.name?.toLowerCase() || '';
        const sku = skuNode?.sku_code?.toLowerCase() || '';
        const brand = productNode?.brand?.toLowerCase() || '';
        return name.includes(q) || sku.includes(q) || brand.includes(q);
    });

    const getStockStatus = (qty: number) => {
        if (qty === 0) return 'sold-out';
        if (qty <= 10) return 'low-stock';
        return 'in-stock';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in-stock':
                return <span className="px-3 py-1 bg-primary text-charcoal text-[9px] font-black uppercase tracking-widest rounded-full">In Stock</span>;
            case 'low-stock':
                return <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest rounded-full">Low Stock</span>;
            case 'sold-out':
                return <span className="px-3 py-1 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full">Sold Out</span>;
            default:
                return null;
        }
    };

    const handleUpdateSaved = () => {
        setEditItem(null);
        fetchInventory();
    };

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <AdminLayout activeNav="Inventory">
                {/* Header */}
                <header className="flex flex-wrap justify-between items-center gap-6 mb-12">
                    <div>
                        <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">Inventory Management</p>
                        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">
                            Store <span className="text-primary">Inventory</span>
                        </h1>
                    </div>
                </header>

                {/* Store Selector */}
                <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-black tracking-tight uppercase italic">Select Store</h2>
                        <div className="h-[2px] flex-1 bg-charcoal/10"></div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <motion.span className="material-symbols-outlined text-2xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-border-light">
                            <span className="material-symbols-outlined text-4xl opacity-20">store</span>
                            <p className="text-xs font-bold opacity-40 mt-2">Chưa có store nào. Tạo store trước tại Dashboard.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {stores.map((store) => {
                                const sid = store._id || store.id;
                                const isSelected = selectedStore === sid;
                                return (
                                    <motion.button
                                        key={sid}
                                        onClick={() => setSelectedStore(sid)}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${isSelected
                                            ? 'bg-primary border-charcoal shadow-lg'
                                            : 'bg-white border-border-light hover:border-primary'}`}
                                        whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`size-2 rounded-full ${store.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50">{store.status}</span>
                                        </div>
                                        <h3 className="font-black uppercase italic text-sm">{store.name}</h3>
                                        <p className="text-[10px] font-bold opacity-50 mt-1 truncate">{store.address}</p>
                                        {store.manager && (
                                            <p className="text-[9px] font-bold text-blue-500 mt-1 truncate">👤 {store.manager.name}</p>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </motion.section>

                {/* Store Stats */}
                {selectedStore && (
                    <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-border-light">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-primary">store</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Current Store</span>
                                </div>
                                <p className="text-xl font-black italic truncate">{currentStore?.name || '—'}</p>
                            </div>
                            <div className="bg-charcoal text-white p-6 rounded-[2rem]">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-primary">inventory</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Stock</span>
                                </div>
                                <p className="text-4xl font-black italic text-primary">{totalStock}</p>
                                <p className="text-[10px] font-bold opacity-40 mt-1">{totalSKUs} SKU(s)</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-border-light">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-orange-500">warning</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Low Stock</span>
                                </div>
                                <p className="text-4xl font-black italic text-orange-500">{lowStockCount}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-border-light">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-red-500">block</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Sold Out</span>
                                </div>
                                <p className="text-4xl font-black italic text-red-500">{soldOutCount}</p>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Inventory Table */}
                {selectedStore && (
                    <motion.section className="pb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-black tracking-tight uppercase italic">
                                {currentStore?.name} Inventory
                            </h2>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30">search</span>
                                <input type="text" placeholder="Tìm product, SKU, brand..."
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-4 py-3 bg-white border border-border-light rounded-full text-xs font-bold focus:ring-2 focus:ring-primary" />
                            </div>
                        </div>

                        {loadingInv ? (
                            <div className="flex justify-center py-20">
                                <motion.span className="material-symbols-outlined text-4xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                            </div>
                        ) : filteredInventory.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-[2.5rem] border border-border-light">
                                <span className="material-symbols-outlined text-5xl opacity-20 mb-3">inventory_2</span>
                                <p className="font-black uppercase tracking-widest opacity-40 text-sm">
                                    {searchQuery ? 'Không tìm thấy kết quả' : 'Store này chưa có inventory'}
                                </p>
                                <p className="text-xs opacity-30 mt-1">Thêm tồn kho qua trang Products → SKU → Set inventory</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border border-border-light overflow-hidden shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-charcoal text-white">
                                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Product</th>
                                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]">SKU</th>
                                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Size / Color</th>
                                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Stock</th>
                                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Price</th>
                                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-center">Status</th>
                                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <AnimatePresence>
                                                {filteredInventory.map((item: any, index: number) => {
                                                    const sku = item.sku || item.sku_id;
                                                    const product = sku?.product || sku?.product_id;
                                                    const status = getStockStatus(item.quantity);
                                                    const imgUrl = product?.images?.[0]?.url || '';

                                                    return (
                                                        <motion.tr
                                                            key={item.id || item._id || index}
                                                            className={`hover:bg-primary/5 transition-colors ${status === 'sold-out' ? 'opacity-50 grayscale' : ''}`}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.03 }}
                                                        >
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="size-14 rounded-xl bg-gray-50 overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                                                                        {imgUrl ? (
                                                                            <img src={imgUrl} alt={product?.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className="material-symbols-outlined text-gray-300">image</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-black italic uppercase text-sm truncate">{product?.name || 'N/A'}</p>
                                                                        <p className="text-[10px] font-bold opacity-40 truncate">{product?.brand || ''}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <span className="text-xs font-mono font-bold opacity-60">{sku?.sku_code || '—'}</span>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-black bg-charcoal text-white px-2 py-0.5 rounded">{sku?.size || '—'}</span>
                                                                    <span className="text-xs font-bold opacity-60">{sku?.color || ''}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full transition-all ${status === 'in-stock' ? 'bg-primary' : status === 'low-stock' ? 'bg-orange-500' : 'bg-gray-300'}`}
                                                                            style={{ width: `${Math.min((item.quantity / 100) * 100, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-sm font-black">{item.quantity}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <span className="font-black text-lg text-primary">{product?.price ? formatPrice(product.price) : '—'}</span>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                {getStatusBadge(status)}
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <motion.button
                                                                    onClick={() => setEditItem(item)}
                                                                    className="px-4 py-2 bg-primary/20 rounded-xl text-[10px] font-black uppercase hover:bg-primary transition-colors flex items-center gap-1"
                                                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                                                    Cập nhật
                                                                </motion.button>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.section>
                )}

                {/* Update Modal */}
                <AnimatePresence>
                    {editItem && (
                        <UpdateQtyModal
                            item={editItem}
                            storeId={selectedStore}
                            onClose={() => setEditItem(null)}
                            onSaved={handleUpdateSaved}
                        />
                    )}
                </AnimatePresence>
            </AdminLayout>
        </motion.div>
    );
};

export default AdminInventoryPage;
