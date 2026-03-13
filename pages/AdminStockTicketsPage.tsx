import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition } from '../utils/animations';
import { storeApi } from '../services/storeApi';
import { inventoryApi } from '../services/inventoryApi';
import { stockTicketApi, CreateImportTicketData, CreateTransferTicketData, StockTicketItem } from '../services/stockTicketApi';
import { useAuth } from '../context/AuthContext';
import { Store } from '../types';

// ======= STATUS BADGE =======
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        cancelled: 'bg-red-100 text-red-600 border-red-200',
    };
    const icons: Record<string, string> = {
        pending: 'schedule',
        confirmed: 'check_circle',
        cancelled: 'cancel',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            <span className="material-symbols-outlined text-[12px]">{icons[status] || 'help'}</span>
            {status}
        </span>
    );
};

// ======= TYPE BADGE =======
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const isImport = type === 'IMPORT';
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isImport ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
            <span className="material-symbols-outlined text-[12px]">{isImport ? 'inventory' : 'swap_horiz'}</span>
            {isImport ? 'Nhập Hàng' : 'Chuyển Kho'}
        </span>
    );
};

// ======= ADD ITEM ROW =======
interface AddItemRowProps {
    inventoryItems: any[];
    onAdd: (item: StockTicketItem) => void;
}

const AddItemRow: React.FC<AddItemRowProps> = ({ inventoryItems, onAdd }) => {
    const [selectedSku, setSelectedSku] = useState('');
    const [qty, setQty] = useState('');

    const handleAdd = () => {
        if (!selectedSku || !qty || Number(qty) < 1) return;
        onAdd({ sku_id: selectedSku, quantity: Number(qty) });
        setSelectedSku('');
        setQty('');
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary">
                <option value="">— Chọn SKU —</option>
                {inventoryItems.map((inv: any) => {
                    const sku = inv.sku || inv.sku_id;
                    const product = sku?.product || sku?.product_id;
                    const skuId = sku?._id || sku?.id || sku;
                    return (
                        <option key={skuId} value={skuId}>
                            {product?.name || 'N/A'} — {sku?.sku_code || ''} (Size {sku?.size}, {sku?.color}) [{inv.quantity} in stock]
                        </option>
                    );
                })}
            </select>
            <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="SL"
                className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-center focus:ring-2 focus:ring-primary" />
            <motion.button type="button" onClick={handleAdd}
                className="size-10 bg-primary rounded-xl flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-all flex-shrink-0"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <span className="material-symbols-outlined text-lg">add</span>
            </motion.button>
        </div>
    );
};

// ======= CREATE TICKET MODAL =======
interface CreateTicketModalProps {
    type: 'IMPORT' | 'TRANSFER';
    stores: Store[];
    onClose: () => void;
    onCreated: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ type, stores, onClose, onCreated }) => {
    const isImport = type === 'IMPORT';
    const [toStore, setToStore] = useState('');
    const [fromStore, setFromStore] = useState('');
    const [note, setNote] = useState('');
    const [items, setItems] = useState<StockTicketItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [loadingInv, setLoadingInv] = useState(false);

    // Load inventory for the relevant store (for SKU selection)
    const activeStoreId = isImport ? toStore : fromStore;
    useEffect(() => {
        if (!activeStoreId) { setInventoryItems([]); return; }
        const fetchInv = async () => {
            setLoadingInv(true);
            try {
                const res = await inventoryApi.getByStore(activeStoreId, { limit: 200 });
                setInventoryItems(res.data || []);
            } catch (err) { console.error(err); }
            setLoadingInv(false);
        };
        fetchInv();
    }, [activeStoreId]);

    const addItem = (item: StockTicketItem) => {
        // Prevent duplicates
        if (items.find(i => i.sku_id === item.sku_id)) {
            setItems(items.map(i => i.sku_id === item.sku_id ? { ...i, quantity: i.quantity + item.quantity } : i));
        } else {
            setItems([...items, item]);
        }
    };

    const removeItem = (skuId: string) => {
        setItems(items.filter(i => i.sku_id !== skuId));
    };

    const getSkuInfo = (skuId: string) => {
        const inv = inventoryItems.find((i: any) => {
            const sku = i.sku || i.sku_id;
            return (sku?._id || sku?.id || sku) === skuId;
        });
        if (!inv) return { name: 'N/A', skuCode: '', size: '', color: '' };
        const sku = inv.sku || inv.sku_id;
        const product = sku?.product || sku?.product_id;
        return { name: product?.name || 'N/A', skuCode: sku?.sku_code || '', size: sku?.size || '', color: sku?.color || '' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (items.length === 0) { setError('Vui lòng thêm ít nhất 1 SKU'); return; }

        setSaving(true);
        try {
            if (isImport) {
                if (!toStore) { setError('Chọn store nhận hàng'); setSaving(false); return; }
                await stockTicketApi.createImport({ to_store: toStore, items, note });
            } else {
                if (!fromStore) { setError('Chọn store gửi'); setSaving(false); return; }
                if (!toStore) { setError('Chọn store nhận'); setSaving(false); return; }
                if (fromStore === toStore) { setError('Store gửi và nhận phải khác nhau'); setSaving(false); return; }
                await stockTicketApi.createTransfer({ from_store: fromStore, to_store: toStore, items, note });
            }
            onCreated();
        } catch (err: any) {
            setError(err?.message || 'Lỗi tạo phiếu');
            setSaving(false);
        }
    };

    return (
        <motion.div className="fixed inset-0 z-[100] bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                                {isImport ? (
                                    <>Tạo Phiếu <span className="text-blue-500">Nhập Hàng</span></>
                                ) : (
                                    <>Tạo Phiếu <span className="text-violet-500">Chuyển Kho</span></>
                                )}
                            </h2>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
                                {isImport ? 'Import goods to a store' : 'Transfer between stores'}
                            </p>
                        </div>
                        <button onClick={onClose} className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>{error}
                    </div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Store Selection */}
                        {!isImport && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-violet-500 text-sm">output</span>
                                    Store gửi *
                                </label>
                                <select value={fromStore} onChange={(e) => setFromStore(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-violet-500">
                                    <option value="">— Chọn store gửi —</option>
                                    {stores.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name} — {s.address}</option>)}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50 flex items-center gap-2">
                                <span className={`material-symbols-outlined text-sm ${isImport ? 'text-blue-500' : 'text-violet-500'}`}>input</span>
                                Store nhận *
                            </label>
                            <select value={toStore} onChange={(e) => setToStore(e.target.value)}
                                className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ${isImport ? 'focus:ring-blue-500' : 'focus:ring-violet-500'}`}>
                                <option value="">— Chọn store nhận —</option>
                                {stores.filter(s => s._id !== fromStore && s.id !== fromStore).map(s =>
                                    <option key={s._id || s.id} value={s._id || s.id}>{s.name} — {s.address}</option>
                                )}
                            </select>
                        </div>

                        {/* Items */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">category</span>
                                Danh sách SKU ({items.length})
                            </label>

                            {/* Added items */}
                            {items.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {items.map((item, idx) => {
                                        const info = getSkuInfo(item.sku_id);
                                        return (
                                            <motion.div key={item.sku_id}
                                                className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl"
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                                                <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm text-primary">inventory_2</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black truncate">{info.name}</p>
                                                    <p className="text-[9px] font-bold opacity-40">{info.skuCode} • Size {info.size} • {info.color}</p>
                                                </div>
                                                <span className="text-sm font-black text-primary">×{item.quantity}</span>
                                                <button type="button" onClick={() => removeItem(item.sku_id)}
                                                    className="size-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Add new item */}
                            {activeStoreId ? (
                                loadingInv ? (
                                    <div className="flex justify-center py-4">
                                        <motion.span className="material-symbols-outlined text-xl text-primary"
                                            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                    </div>
                                ) : inventoryItems.length === 0 ? (
                                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-bold opacity-40">Store này chưa có SKU nào được assign</p>
                                    </div>
                                ) : (
                                    <AddItemRow inventoryItems={inventoryItems} onAdd={addItem} />
                                )
                            ) : (
                                <div className="text-center py-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs font-bold opacity-40">
                                        {isImport ? 'Chọn store nhận để chọn SKU' : 'Chọn store gửi để chọn SKU'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Ghi chú</label>
                            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary resize-none"
                                placeholder="VD: Nhập hàng đợt tháng 3, Chuyển bổ sung cho chi nhánh..." />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-gray-100">
                            <button type="button" onClick={onClose}
                                className="flex-1 py-4 border-2 border-charcoal rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors">Hủy</button>
                            <motion.button type="submit" disabled={saving || items.length === 0}
                                className={`flex-[1.5] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-40 flex items-center justify-center gap-2 ${isImport ? 'bg-blue-500 text-white hover:bg-charcoal' : 'bg-violet-500 text-white hover:bg-charcoal'}`}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                {saving ? (
                                    <><motion.span className="material-symbols-outlined text-sm"
                                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>Đang tạo...</>
                                ) : (
                                    <>Tạo Phiếu<span className="material-symbols-outlined text-sm">check</span></>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ======= TICKET DETAIL MODAL =======
interface TicketDetailModalProps {
    ticket: any;
    onClose: () => void;
    onAction: () => void;
    userRole: string;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, onAction, userRole }) => {
    const [confirming, setConfirming] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        setConfirming(true);
        setError('');
        try {
            await stockTicketApi.confirm(ticket.id || ticket._id);
            onAction();
        } catch (err: any) {
            setError(err?.message || 'Lỗi confirm');
            setConfirming(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Bạn chắc chắn muốn hủy phiếu này?')) return;
        setCancelling(true);
        setError('');
        try {
            await stockTicketApi.cancel(ticket.id || ticket._id);
            onAction();
        } catch (err: any) {
            setError(err?.message || 'Lỗi hủy phiếu');
            setCancelling(false);
        }
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleString('vi-VN') : '—';
    const isImport = ticket.type === 'IMPORT';

    return (
        <motion.div className="fixed inset-0 z-[100] bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <TypeBadge type={ticket.type} />
                                <StatusBadge status={ticket.status} />
                            </div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">Chi tiết phiếu</h2>
                            <p className="text-[10px] font-mono font-bold opacity-30 mt-1">#{(ticket.id || ticket._id)?.slice(-8)}</p>
                        </div>
                        <button onClick={onClose} className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">{error}</div>}

                    {/* Store Info */}
                    <div className={`grid ${isImport ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-6`}>
                        {!isImport && ticket.from_store && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">output</span>Store gửi
                                </p>
                                <p className="font-black text-sm">{ticket.from_store?.name || ticket.from_store}</p>
                                <p className="text-[10px] font-bold opacity-40">{ticket.from_store?.address || ''}</p>
                            </div>
                        )}
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">input</span>Store nhận
                            </p>
                            <p className="font-black text-sm">{ticket.to_store?.name || ticket.to_store}</p>
                            <p className="text-[10px] font-bold opacity-40">{ticket.to_store?.address || ''}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">
                            Danh sách SKU ({ticket.items?.length || 0})
                        </p>
                        <div className="space-y-2">
                            {ticket.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm text-primary">inventory_2</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black truncate">{item.product?.name || item.sku_code || 'N/A'}</p>
                                        <p className="text-[9px] font-bold opacity-40">{item.sku_code || ''} • Size {item.size || ''} • {item.color || ''}</p>
                                    </div>
                                    <span className="text-sm font-black text-primary">×{item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    {ticket.note && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Ghi chú</p>
                            <p className="text-xs font-bold">{ticket.note}</p>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-3 mb-6 text-[10px]">
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="font-black uppercase tracking-widest opacity-30 mb-1">Người tạo</p>
                            <p className="font-bold">{ticket.created_by?.name || ticket.created_by?.email || '—'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="font-black uppercase tracking-widest opacity-30 mb-1">Ngày tạo</p>
                            <p className="font-bold">{formatDate(ticket.createdAt)}</p>
                        </div>
                        {ticket.confirmed_by && (
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <p className="font-black uppercase tracking-widest text-emerald-400 mb-1">Người confirm</p>
                                <p className="font-bold">{ticket.confirmed_by?.name || '—'}</p>
                            </div>
                        )}
                        {ticket.confirmed_at && (
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <p className="font-black uppercase tracking-widest text-emerald-400 mb-1">Ngày confirm</p>
                                <p className="font-bold">{formatDate(ticket.confirmed_at)}</p>
                            </div>
                        )}
                        {ticket.cancelled_by && (
                            <div className="p-3 bg-red-50 rounded-xl">
                                <p className="font-black uppercase tracking-widest text-red-400 mb-1">Người hủy</p>
                                <p className="font-bold">{ticket.cancelled_by?.name || '—'}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {ticket.status === 'pending' && (
                        <div className="flex gap-3 pt-6 border-t border-gray-100">
                            <motion.button onClick={handleConfirm} disabled={confirming}
                                className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-charcoal transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                {confirming ? (
                                    <><motion.span className="material-symbols-outlined text-sm"
                                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>Đang xử lý...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-sm">check_circle</span>Confirm Phiếu</>
                                )}
                            </motion.button>
                            {userRole === 'admin' && (
                                <motion.button onClick={handleCancel} disabled={cancelling}
                                    className="py-4 px-6 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    {cancelling ? 'Đang hủy...' : (
                                        <><span className="material-symbols-outlined text-sm">cancel</span>Hủy</>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};


// ======= MAIN PAGE =======
const AdminStockTicketsPage: React.FC = () => {
    const { user } = useAuth();
    const [stores, setStores] = useState<Store[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterStore, setFilterStore] = useState('');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState<'IMPORT' | 'TRANSFER' | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

    // Stats
    const pendingCount = tickets.filter(t => t.status === 'pending').length;
    const confirmedCount = tickets.filter(t => t.status === 'confirmed').length;
    const cancelledCount = tickets.filter(t => t.status === 'cancelled').length;
    const importCount = tickets.filter(t => t.type === 'IMPORT').length;
    const transferCount = tickets.filter(t => t.type === 'TRANSFER').length;

    // Load stores
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await storeApi.getAll({ limit: 50 });
                setStores(res.data || []);
            } catch (err) { console.error(err); }
        };
        fetchStores();
    }, []);

    // Load tickets
    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 50 };
            if (filterType) params.type = filterType;
            if (filterStatus) params.status = filterStatus;
            if (filterStore) params.store_id = filterStore;
            const res = await stockTicketApi.getAll(params);
            setTickets(res.data || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchTickets(); }, [filterType, filterStatus, filterStore]);

    const handleCreated = () => {
        setShowCreateModal(null);
        fetchTickets();
    };

    const handleAction = () => {
        setSelectedTicket(null);
        fetchTickets();
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <AdminLayout activeNav="Stock Tickets">
                {/* Header */}
                <header className="flex flex-wrap justify-between items-start gap-6 mb-10">
                    <div>
                        <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">Quản Lý Phiếu</p>
                        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">
                            Stock <span className="text-primary">Tickets</span>
                        </h1>
                        <p className="text-xs font-bold opacity-40 mt-2">Phiếu Nhập Hàng & Chuyển Kho</p>
                    </div>
                    <div className="flex gap-3">
                        <motion.button onClick={() => setShowCreateModal('IMPORT')}
                            className="bg-blue-500 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-charcoal transition-all shadow-xl flex items-center gap-2"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <span className="material-symbols-outlined text-lg">inventory</span>
                            Nhập Hàng
                        </motion.button>
                        <motion.button onClick={() => setShowCreateModal('TRANSFER')}
                            className="bg-violet-500 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-charcoal transition-all shadow-xl flex items-center gap-2"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <span className="material-symbols-outlined text-lg">swap_horiz</span>
                            Chuyển Kho
                        </motion.button>
                    </div>
                </header>

                {/* Stats Cards */}
                <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-charcoal text-white p-5 rounded-[2rem]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Tổng</span>
                            </div>
                            <p className="text-3xl font-black italic text-primary">{tickets.length}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-border-light">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-amber-500">schedule</span>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Pending</span>
                            </div>
                            <p className="text-3xl font-black italic text-amber-500">{pendingCount}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-border-light">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Confirmed</span>
                            </div>
                            <p className="text-3xl font-black italic text-emerald-500">{confirmedCount}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-border-light">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-blue-500">inventory</span>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Nhập</span>
                            </div>
                            <p className="text-3xl font-black italic text-blue-500">{importCount}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-border-light">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-violet-500">swap_horiz</span>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Chuyển</span>
                            </div>
                            <p className="text-3xl font-black italic text-violet-500">{transferCount}</p>
                        </div>
                    </div>
                </motion.section>

                {/* Filters */}
                <motion.section className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Filter:</span>
                        {/* Type Filter */}
                        <div className="flex bg-white rounded-xl border border-border-light overflow-hidden">
                            {[
                                { value: '', label: 'Tất cả', icon: 'list' },
                                { value: 'IMPORT', label: 'Nhập', icon: 'inventory' },
                                { value: 'TRANSFER', label: 'Chuyển', icon: 'swap_horiz' },
                            ].map(f => (
                                <button key={f.value} onClick={() => setFilterType(f.value)}
                                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${filterType === f.value ? 'bg-primary text-charcoal' : 'text-charcoal/50 hover:text-charcoal hover:bg-gray-50'}`}>
                                    <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Status Filter */}
                        <div className="flex bg-white rounded-xl border border-border-light overflow-hidden">
                            {[
                                { value: '', label: 'All' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'confirmed', label: 'Confirmed' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ].map(f => (
                                <button key={f.value} onClick={() => setFilterStatus(f.value)}
                                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === f.value ? 'bg-charcoal text-white' : 'text-charcoal/50 hover:text-charcoal hover:bg-gray-50'}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Store Filter */}
                        <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)}
                            className="bg-white border border-border-light rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary">
                            <option value="">Tất cả stores</option>
                            {stores.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
                        </select>

                        <motion.button onClick={() => { setFilterType(''); setFilterStatus(''); setFilterStore(''); }}
                            className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            whileHover={{ scale: 1.02 }}>
                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                        </motion.button>
                    </div>
                </motion.section>

                {/* Tickets Table */}
                <motion.section className="pb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <motion.span className="material-symbols-outlined text-4xl text-primary"
                                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-border-light">
                            <span className="material-symbols-outlined text-6xl opacity-20 mb-4">receipt_long</span>
                            <p className="font-black uppercase tracking-widest opacity-40 mb-2">Chưa có phiếu nào</p>
                            <p className="text-xs opacity-30">Tạo phiếu nhập hàng hoặc chuyển kho để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] border border-border-light overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-charcoal text-white">
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Mã phiếu</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Loại</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Stores</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Items</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Người tạo</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Ngày tạo</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <AnimatePresence>
                                            {tickets.map((ticket: any, index: number) => {
                                                const tid = ticket.id || ticket._id;
                                                const isImport = ticket.type === 'IMPORT';
                                                const totalQty = ticket.items?.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0) || 0;
                                                return (
                                                    <motion.tr key={tid}
                                                        className={`hover:bg-primary/5 transition-colors cursor-pointer ${ticket.status === 'cancelled' ? 'opacity-40' : ''}`}
                                                        onClick={() => setSelectedTicket(ticket)}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.03 }}>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-mono font-black text-primary">#{tid?.slice(-8)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <TypeBadge type={ticket.type} />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs">
                                                                {!isImport && ticket.from_store && (
                                                                    <p className="font-bold flex items-center gap-1 text-red-500 mb-0.5">
                                                                        <span className="material-symbols-outlined text-[12px]">output</span>
                                                                        {ticket.from_store?.name || '—'}
                                                                    </p>
                                                                )}
                                                                <p className="font-bold flex items-center gap-1 text-emerald-600">
                                                                    <span className="material-symbols-outlined text-[12px]">input</span>
                                                                    {ticket.to_store?.name || '—'}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black">{ticket.items?.length || 0}</span>
                                                                <span className="text-[9px] font-bold opacity-40">SKU</span>
                                                                <span className="text-[10px] font-bold text-primary">({totalQty} pcs)</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-xs font-bold">{ticket.created_by?.name || ticket.created_by?.email || '—'}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[10px] font-bold opacity-50">{formatDate(ticket.createdAt)}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <StatusBadge status={ticket.status} />
                                                        </td>
                                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex gap-2">
                                                                <motion.button onClick={() => setSelectedTicket(ticket)}
                                                                    className="px-3 py-2 bg-gray-100 rounded-xl text-[10px] font-black uppercase hover:bg-primary transition-colors flex items-center gap-1"
                                                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                                    Chi tiết
                                                                </motion.button>
                                                                {ticket.status === 'pending' && (
                                                                    <motion.button
                                                                        onClick={async () => {
                                                                            try {
                                                                                await stockTicketApi.confirm(tid);
                                                                                fetchTickets();
                                                                            } catch (err: any) { alert(err?.message || 'Error'); }
                                                                        }}
                                                                        className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-1"
                                                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                                                        Confirm
                                                                    </motion.button>
                                                                )}
                                                            </div>
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
            </AdminLayout>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateTicketModal
                        type={showCreateModal}
                        stores={stores}
                        onClose={() => setShowCreateModal(null)}
                        onCreated={handleCreated}
                    />
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <TicketDetailModal
                        ticket={selectedTicket}
                        onClose={() => setSelectedTicket(null)}
                        onAction={handleAction}
                        userRole={user?.role || 'customer'}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminStockTicketsPage;
