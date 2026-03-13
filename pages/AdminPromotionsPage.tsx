import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition } from '../utils/animations';
import { promotionApi } from '../services/promotionApi';
import { Promotion } from '../types';
import { formatPrice } from '../utils/formatPrice';

// ======= Promotion Form Modal =======
interface PromotionFormProps {
    promotion?: Promotion | null;
    onClose: () => void;
    onSaved: () => void;
}

const PromotionFormModal: React.FC<PromotionFormProps> = ({ promotion, onClose, onSaved }) => {
    const isEdit = !!promotion;
    const [code, setCode] = useState(promotion?.code || '');
    const [description, setDescription] = useState(promotion?.description || '');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(promotion?.discount_type || 'percentage');
    const [discountValue, setDiscountValue] = useState(promotion?.discount_value?.toString() || '');
    const [minOrderValue, setMinOrderValue] = useState(promotion?.min_order_value?.toString() || '0');
    const [maxDiscountAmount, setMaxDiscountAmount] = useState(promotion?.max_discount_amount?.toString() || '');
    const [startDate, setStartDate] = useState(promotion?.start_date ? promotion.start_date.slice(0, 16) : '');
    const [endDate, setEndDate] = useState(promotion?.end_date ? promotion.end_date.slice(0, 16) : '');
    const [usageLimit, setUsageLimit] = useState(promotion?.usage_limit?.toString() || '');
    const [isActive, setIsActive] = useState(promotion?.is_active ?? true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!code.trim()) return setError('Mã promo là bắt buộc');
        if (!discountValue || Number(discountValue) <= 0) return setError('Giá trị giảm phải > 0');
        if (discountType === 'percentage' && Number(discountValue) > 100) return setError('Phần trăm giảm không vượt quá 100');
        if (!startDate || !endDate) return setError('Ngày bắt đầu và kết thúc là bắt buộc');
        if (new Date(startDate) >= new Date(endDate)) return setError('Ngày kết thúc phải sau ngày bắt đầu');

        setSaving(true);
        try {
            const data: any = {
                code: code.trim().toUpperCase(),
                description: description.trim(),
                discount_type: discountType,
                discount_value: Number(discountValue),
                min_order_value: Number(minOrderValue) || 0,
                max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                usage_limit: usageLimit ? Number(usageLimit) : null,
                is_active: isActive,
            };
            if (isEdit) {
                await promotionApi.update(promotion!.id || promotion!._id!, data);
            } else {
                await promotionApi.create(data);
            }
            onSaved();
        } catch (err: any) {
            setError(err?.message || 'Loi khi luu promotion');
            setSaving(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                initial={{ scale: 0.92, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 50, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">
                        {isEdit ? 'Sua Promotion' : 'Tao Promotion Moi'}
                    </h2>
                    <button onClick={onClose} className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-sm font-bold text-red-600 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>{error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Ma Promo *</span>
                            <input className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold uppercase placeholder:opacity-30 focus:border-primary focus:ring-0" value={code} onChange={e => setCode(e.target.value)} placeholder="VD: SUMMER30" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Loai giam gia *</span>
                            <select className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary focus:ring-0 appearance-none cursor-pointer" value={discountType} onChange={e => setDiscountType(e.target.value as any)}>
                                <option value="percentage">Phan tram (%)</option>
                                <option value="fixed">So tien co dinh (VND)</option>
                            </select>
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Mo ta</span>
                        <input className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-0" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mo ta khuyen mai..." />
                    </label>

                    <div className="grid grid-cols-3 gap-4">
                        <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Gia tri giam *</span>
                            <input type="number" className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-0" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder={discountType === 'percentage' ? '10' : '50000'} />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Don toi thieu (VND)</span>
                            <input type="number" className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-0" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} placeholder="0" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Giam toi da (VND)</span>
                            <input type="number" className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-0" value={maxDiscountAmount} onChange={e => setMaxDiscountAmount(e.target.value)} placeholder="Khong gioi han" />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Ngay bat dau *</span>
                            <input type="datetime-local" className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary focus:ring-0" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Ngay ket thuc *</span>
                            <input type="datetime-local" className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary focus:ring-0" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40">Gioi han su dung</span>
                            <input type="number" className="w-full bg-background-alt border-2 border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-0" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="Khong gioi han" />
                        </label>
                        <label className="flex items-center gap-3 pt-6">
                            <button type="button" onClick={() => setIsActive(!isActive)} className={`relative w-12 h-7 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-gray-300'}`}>
                                <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${isActive ? 'left-6' : 'left-1'}`} />
                            </button>
                            <span className="text-sm font-black uppercase tracking-widest">{isActive ? 'Kich hoat' : 'Tat'}</span>
                        </label>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 border-2 border-charcoal rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">Huy</button>
                    <button onClick={handleSubmit as any} disabled={saving} className="flex-[1.5] py-3 bg-charcoal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-charcoal transition-colors disabled:opacity-50">
                        {saving ? 'Dang luu...' : isEdit ? 'Cap nhat' : 'Tao moi'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ======= Main Page =======
const AdminPromotionsPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editPromo, setEditPromo] = useState<Promotion | null>(null);
    const [deleting, setDeleting] = useState('');

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await promotionApi.getAll({ page, limit: 10, search: search || undefined });
            setPromotions(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch promotions', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchPromotions(); }, [page, search]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Ban co chac muon xoa promotion nay?')) return;
        setDeleting(id);
        try {
            await promotionApi.delete(id);
            fetchPromotions();
        } catch (err: any) {
            alert(err?.message || 'Xoa that bai');
        }
        setDeleting('');
    };

    const handleSaved = () => {
        setShowModal(false);
        setEditPromo(null);
        fetchPromotions();
    };

    const formatDate = (d: string) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const isExpired = (endDate: string) => new Date(endDate) < new Date();
    const isNotStarted = (startDate: string) => new Date(startDate) > new Date();

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <AdminLayout activeNav="Promotions">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Promotions</h1>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Quan ly ma khuyen mai</p>
                    </div>
                    <motion.button
                        onClick={() => { setEditPromo(null); setShowModal(true); }}
                        className="px-6 py-3 bg-charcoal text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-charcoal transition-colors shadow-lg"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Tao moi
                    </motion.button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30">search</span>
                        <input
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-0"
                            placeholder="Tim kiem ma promo..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-charcoal/40">Code</th>
                                    <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-charcoal/40">Loai</th>
                                    <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-widest text-charcoal/40">Gia tri</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-charcoal/40">Thoi gian</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-charcoal/40">Su dung</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-charcoal/40">Trang thai</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-charcoal/40">Hanh dong</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12">
                                            <motion.span className="material-symbols-outlined text-primary text-3xl" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                        </td>
                                    </tr>
                                ) : promotions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-sm font-bold opacity-40">Khong co promotion nao</td>
                                    </tr>
                                ) : promotions.map((promo) => {
                                    const expired = isExpired(promo.end_date);
                                    const notStarted = isNotStarted(promo.start_date);
                                    return (
                                        <tr key={promo.id || promo._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black uppercase tracking-widest bg-charcoal text-white px-3 py-1 rounded-lg">{promo.code}</span>
                                                {promo.description && <p className="text-[10px] opacity-40 mt-1 truncate max-w-[200px]">{promo.description}</p>}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${promo.discount_type === 'percentage' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    {promo.discount_type === 'percentage' ? '%' : 'VND'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-black">
                                                {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : formatPrice(promo.discount_value)}
                                                {promo.max_discount_amount && (
                                                    <p className="text-[9px] opacity-40">Max: {formatPrice(promo.max_discount_amount)}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center text-[10px] font-bold opacity-60">
                                                {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm font-black">
                                                {promo.used_count}{promo.usage_limit !== null ? `/${promo.usage_limit}` : ''}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {!promo.is_active ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Tat</span>
                                                ) : expired ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 px-2 py-1 rounded-full">Het han</span>
                                                ) : notStarted ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full">Chua bat dau</span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-2 py-1 rounded-full">Hoat dong</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        onClick={() => { setEditPromo(promo); setShowModal(true); }}
                                                        className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleDelete(promo.id || promo._id!)}
                                                        disabled={deleting === (promo.id || promo._id)}
                                                        className="size-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-30"
                                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-100">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="size-10 rounded-xl border-2 border-gray-100 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-30"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`size-10 rounded-xl text-xs font-black transition-colors ${p === page ? 'bg-charcoal text-white' : 'border-2 border-gray-100 hover:border-primary'}`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="size-10 rounded-xl border-2 border-gray-100 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-30"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {showModal && (
                        <PromotionFormModal
                            promotion={editPromo}
                            onClose={() => { setShowModal(false); setEditPromo(null); }}
                            onSaved={handleSaved}
                        />
                    )}
                </AnimatePresence>
            </AdminLayout>
        </motion.div>
    );
};

export default AdminPromotionsPage;
