import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';
import { productApi } from '../services/productApi';
import { storeApi } from '../services/storeApi';
import { inventoryApi } from '../services/inventoryApi';
import { colorApi } from '../services/colorApi';
import { Store, Color } from '../types';
import { formatPrice } from '../utils/formatPrice';

// ======= Add/Edit Product Modal =======
interface ProductFormProps {
    product?: any;
    onClose: () => void;
    onSaved: () => void;
}

const ProductFormModal: React.FC<ProductFormProps> = ({ product, onClose, onSaved }) => {
    const isEdit = !!product;
    const [name, setName] = useState(product?.name || '');
    const [brand, setBrand] = useState(product?.brand || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(product?.images?.[0]?.url || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [imgError, setImgError] = useState(false);

    // Track which fields have been touched for validation UX
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setTouched({ name: true, brand: true, price: true });
        if (!name || !brand || !price) { setError('Vui lòng điền đầy đủ các trường bắt buộc (*)'); return; }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('brand', brand.trim());
            formData.append('description', description.trim());
            formData.append('price', String(Number(price)));
            if (imageFile) {
                formData.append('images', imageFile);
            }
            if (isEdit) {
                await productApi.update(product.id || product._id, formData);
            } else {
                await productApi.create(formData);
            }
            onSaved();
        } catch (err: any) {
            setError(err?.message || 'Lỗi khi lưu sản phẩm');
            setSaving(false);
        }
    };

    // Progress indicator
    const filledCount = [name, brand, price].filter(Boolean).length;
    const totalRequired = 3;

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                {/* ── Top accent bar ── */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-yellow-300 to-primary rounded-t-[2rem]" />

                {/* ── Header ── */}
                <div className="px-8 pt-7 pb-0 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-xl">
                                {isEdit ? 'edit_note' : 'add_box'}
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                                {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                            </p>
                        </div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">
                            {isEdit ? product?.name : 'Sản phẩm'}
                        </h2>
                    </div>
                    <motion.button
                        type="button"
                        onClick={onClose}
                        className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors"
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </motion.button>
                </div>

                {/* ── Progress bar ── */}
                <div className="px-8 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            Tiến độ điền form
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                            {filledCount}/{totalRequired} bắt buộc
                        </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-yellow-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(filledCount / totalRequired) * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* ── Scrollable form ── */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 pt-4 space-y-5">
                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">error</span>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Name + Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                                <span className="material-symbols-outlined text-[14px] text-primary">badge</span>
                                Tên sản phẩm <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => markTouched('name')}
                                className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 text-sm font-bold placeholder:font-normal placeholder:opacity-40 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all outline-none ${touched.name && !name ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                                    }`}
                                placeholder="VD: Air Max 270"
                            />
                            {touched.name && !name && (
                                <p className="text-[9px] font-bold text-red-400 mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">warning</span>
                                    Trường bắt buộc
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                                <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
                                Brand <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                onBlur={() => markTouched('brand')}
                                className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 text-sm font-bold placeholder:font-normal placeholder:opacity-40 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all outline-none ${touched.brand && !brand ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                                    }`}
                                placeholder="VD: Nike, Adidas..."
                            />
                            {touched.brand && !brand && (
                                <p className="text-[9px] font-bold text-red-400 mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">warning</span>
                                    Trường bắt buộc
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                            <span className="material-symbols-outlined text-[14px] text-primary">description</span>
                            Mô tả
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:font-normal placeholder:opacity-40 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all outline-none resize-none"
                            placeholder="Mô tả sản phẩm..."
                        />
                        <p className="text-[9px] font-bold opacity-30 mt-1 text-right">{description.length} ký tự</p>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                            <span className="material-symbols-outlined text-[14px] text-primary">payments</span>
                            Giá (VND) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-primary">₫</span>
                            <input
                                type="number"
                                min="1000"
                                step="1"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                onBlur={() => markTouched('price')}
                                className={`w-full bg-gray-50 border-2 rounded-xl pl-10 pr-4 py-3 text-sm font-bold placeholder:font-normal placeholder:opacity-40 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all outline-none ${touched.price && !price ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                                    }`}
                                placeholder="4725000"
                            />
                        </div>
                        {touched.price && !price && (
                            <p className="text-[9px] font-bold text-red-400 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">warning</span>
                                Trường bắt buộc
                            </p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                            <span className="material-symbols-outlined text-[14px] text-primary">image</span>
                            Ảnh sản phẩm
                        </label>
                        <div
                            className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                            onClick={() => document.getElementById('product-image-input')?.click()}
                        >
                            <span className="material-symbols-outlined text-3xl text-gray-400 mb-1">cloud_upload</span>
                            <p className="text-sm font-bold text-gray-500">Click để chọn ảnh</p>
                            <p className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP (tối đa 5MB)</p>
                        </div>
                        <input
                            id="product-image-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                    setImgError(false);
                                }
                            }}
                        />

                        {/* Image Preview */}
                        {imagePreview && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl"
                            >
                                {!imgError ? (
                                    <div className="flex items-center gap-4">
                                        <div className="size-20 rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                            <img
                                                src={imagePreview}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                                onError={() => setImgError(true)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-1 mb-1">
                                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                {imageFile ? imageFile.name : 'Ảnh hiện tại'}
                                            </p>
                                            {imageFile && (
                                                <p className="text-[9px] font-bold opacity-30">{(imageFile.size / 1024).toFixed(1)} KB</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(''); }}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 py-2">
                                        <span className="material-symbols-outlined text-xl text-red-400">broken_image</span>
                                        <div>
                                            <p className="text-[10px] font-black text-red-500">Không tải được ảnh</p>
                                            <p className="text-[9px] font-bold opacity-40">Chọn ảnh khác</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex gap-3 pt-5 border-t border-gray-100">
                        <motion.button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:border-gray-400 hover:text-charcoal transition-colors flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Hủy
                        </motion.button>

                        <motion.button
                            type="submit"
                            disabled={saving}
                            className="flex-[1.8] py-3.5 bg-charcoal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-charcoal transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {saving ? (
                                <>
                                    <motion.span
                                        className="material-symbols-outlined text-sm"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >sync</motion.span>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">
                                        {isEdit ? 'save' : 'add_circle'}
                                    </span>
                                    {isEdit ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


// ======= SKU + Inventory Modal =======
interface SKUModalProps {
    product: any;
    stores: Store[];
    colors: Color[];
    onClose: () => void;
}

const SKUInventoryModal: React.FC<SKUModalProps> = ({ product, stores, colors, onClose }) => {
    const [skus, setSkus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSize, setNewSize] = useState('');
    const [newColor, setNewColor] = useState('');
    const [newSku, setNewSku] = useState('');
    const [skuManualEdit, setSkuManualEdit] = useState(false);
    const [addingSku, setAddingSku] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [error, setError] = useState('');

    // For inventory
    const [selectedSku, setSelectedSku] = useState<any>(null);
    const [inventoryMap, setInventoryMap] = useState<Record<string, number>>({});
    const [updatingInventory, setUpdatingInventory] = useState('');
    const [inventoryQty, setInventoryQty] = useState<Record<string, string>>({});
    const [inventoryNote, setInventoryNote] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const productId = product.id || product._id;

    const fetchSkus = async () => {
        setLoading(true);
        try {
            const res = await productApi.getSkus(productId);
            setSkus(res.data || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchSkus(); }, []);

    // Auto-generate SKU code: BRAND(3)-NAME(3)-COLOR(3)-SIZE
    const generateSkuCode = (size: string, color: string) => {
        if (!size || !color || !product) return '';
        const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
        const brand = sanitize(product.brand || 'XXX');
        const name = sanitize(product.name || 'XXX');
        const col = sanitize(color);
        return `${brand}-${name}-${col}-${size}`;
    };

    // Auto-update SKU code when size/color changes (unless manually edited)
    useEffect(() => {
        if (!skuManualEdit && newSize && newColor) {
            setNewSku(generateSkuCode(newSize, newColor));
        }
    }, [newSize, newColor, skuManualEdit]);

    const handleAddSku = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newSize || !newColor || !newSku) { setError('Size, Color và SKU Code là bắt buộc'); return; }
        setAddingSku(true);
        try {
            await productApi.createSku(productId, { size: Number(newSize) as any, color: newColor.trim(), sku_code: newSku.trim() });
            setNewSize(''); setNewColor(''); setNewSku(''); setSkuManualEdit(false);
            fetchSkus();
        } catch (err: any) {
            setError(err?.message || 'Lỗi tạo SKU');
        }
        setAddingSku(false);
    };

    // Fetch inventory for selected SKU across all stores
    const handleSelectSku = async (sku: any) => {
        setSelectedSku(sku);
        setSuccessMsg('');
        const skuId = sku.id || sku._id;
        try {
            const res = await inventoryApi.getBySku(skuId);
            const map: Record<string, number> = {};
            const qtyMap: Record<string, string> = {};
            (res.data || []).forEach((inv: any) => {
                const sid = inv.store_id?._id || inv.store_id;
                map[sid] = inv.quantity;
                qtyMap[sid] = String(inv.quantity);
            });
            // Initialize empty stores with 0
            stores.forEach(s => {
                const sid = (s as any)._id || s.id;
                if (!(sid in map)) {
                    map[sid] = 0;
                    qtyMap[sid] = '';
                }
            });
            setInventoryMap(map);
            setInventoryQty(qtyMap);
        } catch (err) { console.error(err); }
    };

    const handleUpdateInventory = async (storeId: string) => {
        const skuId = selectedSku?.id || selectedSku?._id;
        if (!skuId) return;
        const qty = Number(inventoryQty[storeId] || 0);
        if (isNaN(qty) || qty < 0) { alert('Số lượng không hợp lệ'); return; }
        setUpdatingInventory(storeId);
        setSuccessMsg('');
        try {
            await inventoryApi.update(storeId, skuId, {
                quantity: qty,
                note: inventoryNote || `Set ${qty} from admin products`
            });
            setInventoryMap(prev => ({ ...prev, [storeId]: qty }));
            setSuccessMsg(`✅ Đã set ${qty} cho ${stores.find(s => ((s as any)._id || s.id) === storeId)?.name || 'store'}`);
        } catch (err: any) {
            alert(err?.message || 'Lỗi cập nhật inventory');
        }
        setUpdatingInventory('');
    };

    // Set all stores at once
    const handleSetAllStores = async () => {
        const skuId = selectedSku?.id || selectedSku?._id;
        if (!skuId) return;
        setSuccessMsg('');
        let count = 0;
        for (const store of stores) {
            const storeId = (store as any)._id || store.id;
            const qty = Number(inventoryQty[storeId] || 0);
            if (isNaN(qty) || qty < 0) continue;
            if (qty === (inventoryMap[storeId] ?? -1)) continue; // skip unchanged
            try {
                await inventoryApi.update(storeId, skuId, {
                    quantity: qty,
                    note: inventoryNote || `Bulk set from admin products`
                });
                setInventoryMap(prev => ({ ...prev, [storeId]: qty }));
                count++;
            } catch (err) { console.error(err); }
        }
        setSuccessMsg(`✅ Đã cập nhật ${count} store(s)`);
    };

    return (
        <motion.div className="fixed inset-0 z-[100] bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">SKU & Inventory Management</p>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">{product.name}</h2>
                            <p className="text-xs font-bold opacity-40 mt-1">{product.brand} • {formatPrice(product.price)}</p>
                        </div>
                        <button onClick={onClose} className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">{error}</div>}
                    {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-bold">{successMsg}</div>}

                    {/* Flow guide */}
                    <div className="mb-6 p-4 bg-charcoal rounded-2xl text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">📋 Flow vận hành</p>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="px-2 py-1 bg-white/10 rounded-lg">① Tạo SKU</span>
                            <span className="text-primary">→</span>
                            <span className="px-2 py-1 bg-white/10 rounded-lg">② Chọn SKU</span>
                            <span className="text-primary">→</span>
                            <span className="px-2 py-1 bg-white/10 rounded-lg">③ Set số lượng cho từng Store</span>
                            <span className="text-primary">→</span>
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded-lg">✓ Inventory page sẽ hiện</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: SKU List + Add */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">inventory_2</span>
                                Danh sách SKU ({skus.length})
                            </h3>

                            {/* Add SKU form */}
                            <form onSubmit={handleAddSku} className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-40">Thêm SKU mới</p>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {/* Size input with quick picks */}
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest mb-1 opacity-30">Size</label>
                                        <input value={newSize} onChange={(e) => setNewSize(e.target.value)} type="number" min="1" step="0.5"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary" placeholder="VD: 42" />
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {[38, 39, 40, 41, 42, 43, 44].map(s => (
                                                <button key={s} type="button" onClick={() => setNewSize(String(s))}
                                                    className={`px-2 py-0.5 rounded text-[9px] font-black transition-all ${newSize === String(s) ? 'bg-primary text-charcoal' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Color Picker from predefined colors */}
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest mb-1 opacity-30">Màu sắc</label>
                                        <div className="relative">
                                            <div
                                                className={`bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer flex items-center gap-2 hover:border-primary transition-colors ${newColor ? '' : 'opacity-50'}`}
                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                            >
                                                {newColor ? (
                                                    <>
                                                        <span className="size-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: colors.find(c => c.name === newColor)?.code || '#ccc' }}></span>
                                                        {newColor}
                                                    </>
                                                ) : (
                                                    <span>Chọn màu...</span>
                                                )}
                                                <span className="material-symbols-outlined text-[14px] ml-auto">expand_more</span>
                                            </div>
                                            {showColorPicker && (
                                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 max-h-48 overflow-y-auto">
                                                    {colors.length === 0 ? (
                                                        <p className="text-[10px] font-bold opacity-40 text-center py-2">Chưa có màu nào. Tạo ở panel Colors!</p>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {colors.map(c => (
                                                                <button key={c._id || c.id} type="button"
                                                                    onClick={() => { setNewColor(c.name); setShowColorPicker(false); }}
                                                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-100 transition-all text-left ${newColor === c.name ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
                                                                >
                                                                    <span className="size-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: c.code }}></span>
                                                                    {c.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Auto-generated SKU Code */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-30">SKU Code</label>
                                        <button type="button" onClick={() => setSkuManualEdit(!skuManualEdit)}
                                            className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">{skuManualEdit ? 'auto_fix_high' : 'edit'}</span>
                                            {skuManualEdit ? 'Tự động' : 'Sửa tay'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input value={newSku}
                                            onChange={(e) => { setNewSku(e.target.value); if (!skuManualEdit) setSkuManualEdit(true); }}
                                            readOnly={!skuManualEdit}
                                            className={`flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-black tracking-wider focus:ring-2 focus:ring-primary ${skuManualEdit ? 'bg-white' : 'bg-gray-100 cursor-default'
                                                } ${newSku ? 'text-charcoal' : 'text-gray-400'}`}
                                            placeholder="Chọn size + màu để tự tạo..." />
                                        {newSku && !skuManualEdit && (
                                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">auto_fix_high</span> Auto
                                            </span>
                                        )}
                                    </div>
                                    {newSize && newColor && (
                                        <p className="text-[9px] font-bold opacity-30 mt-1">
                                            Format: {(product.brand || 'XXX').substring(0, 3).toUpperCase()}-{(product.name || 'XXX').replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()}-{newColor.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()}-{newSize}
                                        </p>
                                    )}
                                </div>

                                <button type="submit" disabled={addingSku || !newSize || !newColor || !newSku}
                                    className="w-full py-2.5 bg-primary text-charcoal rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-charcoal hover:text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                                    {addingSku ? (
                                        <><motion.span className="material-symbols-outlined text-sm" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span> Đang tạo...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-sm">add</span> Thêm SKU</>
                                    )}
                                </button>
                            </form>

                            {/* SKU List */}
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <motion.span className="material-symbols-outlined text-2xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                </div>
                            ) : skus.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl">
                                    <span className="material-symbols-outlined text-3xl opacity-20 mb-2">layers</span>
                                    <p className="text-xs font-bold opacity-40">Chưa có SKU nào</p>
                                    <p className="text-[10px] opacity-30 mt-1">Tạo SKU ở form phía trên</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
                                    {skus.map((sku) => {
                                        const skuId = sku.id || sku._id;
                                        const isSelected = (selectedSku?.id || selectedSku?._id) === skuId;
                                        const skuColor = colors.find(c => c.name === sku.color);
                                        return (
                                            <button key={skuId} onClick={() => handleSelectSku(sku)}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between
                                                    ${isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-gray-200 hover:border-primary/40 bg-white'}`}>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-black uppercase">{sku.sku_code}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black bg-charcoal text-white px-2 py-0.5 rounded">Size {sku.size}</span>
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold opacity-50">
                                                            {skuColor && <span className="size-3 rounded-full border border-gray-300" style={{ backgroundColor: skuColor.code }}></span>}
                                                            {sku.color}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined text-sm text-primary">
                                                    {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: Store Inventory for selected SKU */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">store</span>
                                Tồn kho theo Store
                            </h3>

                            {!selectedSku ? (
                                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                    <span className="material-symbols-outlined text-5xl opacity-20 mb-3">touch_app</span>
                                    <p className="text-xs font-bold opacity-40">Chọn 1 SKU bên trái</p>
                                    <p className="text-[10px] opacity-30 mt-1">để xem và cập nhật tồn kho cho các Store</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Selected SKU info */}
                                    <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-xl">
                                        <p className="text-[10px] font-bold opacity-60">
                                            SKU: <span className="text-primary font-black">{selectedSku.sku_code}</span> — Size {selectedSku.size} • {selectedSku.color}
                                        </p>
                                    </div>

                                    {/* Note */}
                                    <div className="mb-4">
                                        <input value={inventoryNote} onChange={(e) => setInventoryNote(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary"
                                            placeholder="Ghi chú (tùy chọn): VD: Nhập đợt mới..." />
                                    </div>

                                    {stores.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-2xl">
                                            <span className="material-symbols-outlined text-3xl opacity-20">store</span>
                                            <p className="text-xs font-bold opacity-40 mt-2">Chưa có Store nào</p>
                                            <p className="text-[10px] opacity-30">Tạo Store ở trang Dashboard trước</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                                                {stores.map((store) => {
                                                    const storeId = (store as any)._id || store.id;
                                                    const currentQty = inventoryMap[storeId];
                                                    const isChanged = inventoryQty[storeId] !== '' && Number(inventoryQty[storeId] || 0) !== (currentQty ?? 0);
                                                    return (
                                                        <div key={storeId} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isChanged ? 'bg-primary/5 border-primary/30' : 'bg-gray-50 border-gray-200'}`}>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`size-2 rounded-full ${store.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                                    <p className="text-xs font-black uppercase truncate">{store.name}</p>
                                                                </div>
                                                                <p className="text-[10px] font-bold opacity-40 truncate mt-0.5">{store.address}</p>
                                                                {currentQty !== undefined && (
                                                                    <p className="text-[9px] font-bold opacity-30 mt-0.5">Hiện tại: {currentQty}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <input type="number" min="0"
                                                                    value={inventoryQty[storeId] ?? ''}
                                                                    onChange={(e) => setInventoryQty(prev => ({ ...prev, [storeId]: e.target.value }))}
                                                                    className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-black text-center focus:ring-2 focus:ring-primary"
                                                                    placeholder="0" />
                                                                <motion.button
                                                                    onClick={() => handleUpdateInventory(storeId)}
                                                                    disabled={updatingInventory === storeId}
                                                                    className="px-3 py-2 bg-primary text-charcoal rounded-lg text-[10px] font-black uppercase hover:bg-charcoal hover:text-white transition-colors disabled:opacity-50"
                                                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    {updatingInventory === storeId ? (
                                                                        <motion.span className="material-symbols-outlined text-[12px]" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                                                    ) : 'Set'}
                                                                </motion.button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Bulk action */}
                                            <motion.button onClick={handleSetAllStores}
                                                className="w-full mt-4 py-3 bg-charcoal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-charcoal transition-colors flex items-center justify-center gap-2"
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <span className="material-symbols-outlined text-sm">done_all</span>
                                                Cập nhật tất cả Stores
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};


// ======= MAIN PAGE =======
const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);
    const [skuProduct, setSkuProduct] = useState<any>(null);
    const [togglingStatus, setTogglingStatus] = useState('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('active');

    // Color management states
    const [showColorManager, setShowColorManager] = useState(false);
    const [newColorName, setNewColorName] = useState('');
    const [newColorCode, setNewColorCode] = useState('#000000');
    const [addingColor, setAddingColor] = useState(false);
    const [editingColor, setEditingColor] = useState<Color | null>(null);
    const [editColorName, setEditColorName] = useState('');
    const [editColorCode, setEditColorCode] = useState('');
    const [deletingColor, setDeletingColor] = useState('');

    // Fetch products with status filter
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productApi.getAllAdmin({ page, limit: 10, search: searchQuery || undefined, sort: '-createdAt', status: statusFilter || undefined });
            setProducts(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
            setTotalCount(res.meta?.totalCount || 0);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const fetchStores = async () => {
        try {
            const res = await storeApi.getAll({ limit: 50 });
            setStores(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchColors = async () => {
        try {
            const res = await colorApi.getAll();
            setColors(res.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchProducts(); }, [page, statusFilter]);
    useEffect(() => { fetchStores(); fetchColors(); }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const handleFormSaved = () => { setShowForm(false); setEditProduct(null); fetchProducts(); };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setTogglingStatus(id);
        try {
            const formData = new FormData();
            formData.append('status', newStatus);
            await productApi.update(id, formData);
            // Update local state so product stays visible with updated status
            setProducts(prev => prev.map(p => (p.id || p._id) === id ? { ...p, status: newStatus } : p));
        } catch (err: any) { alert(err?.message || 'Lỗi cập nhật trạng thái'); }
        setTogglingStatus('');
    };

    // Color handlers
    const handleAddColor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newColorName.trim() || !newColorCode.trim()) return;
        setAddingColor(true);
        try {
            await colorApi.create({ name: newColorName.trim(), code: newColorCode.trim() });
            setNewColorName(''); setNewColorCode('#000000');
            fetchColors();
        } catch (err: any) { alert(err?.message || 'Lỗi tạo màu'); }
        setAddingColor(false);
    };

    const handleUpdateColor = async () => {
        if (!editingColor) return;
        const cid = editingColor._id || editingColor.id;
        try {
            await colorApi.update(cid, { name: editColorName, code: editColorCode });
            setEditingColor(null);
            fetchColors();
        } catch (err: any) { alert(err?.message || 'Lỗi cập nhật'); }
    };

    const handleDeleteColor = async (id: string) => {
        if (!confirm('Xóa màu này?')) return;
        setDeletingColor(id);
        try {
            await colorApi.delete(id);
            fetchColors();
        } catch (err: any) { alert(err?.message || 'Lỗi xóa'); }
        setDeletingColor('');
    };

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <AdminLayout activeNav="Products">
                {/* Header */}
                <header className="flex flex-wrap justify-between items-center gap-6 mb-12">
                    <div>
                        <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">Product Management</p>
                        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">
                            Quản Lý <span className="text-primary">Sản Phẩm</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <motion.button
                            onClick={() => setShowColorManager(!showColorManager)}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-colors flex items-center gap-2 ${showColorManager ? 'bg-charcoal text-white' : 'bg-white border border-border-light text-charcoal hover:bg-primary'}`}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <span className="material-symbols-outlined text-lg">palette</span>
                            Colors ({colors.length})
                        </motion.button>
                        <motion.button
                            onClick={() => { setEditProduct(null); setShowForm(true); }}
                            className="px-6 py-3 bg-primary text-charcoal rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-charcoal hover:text-white transition-colors flex items-center gap-2"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Thêm Sản Phẩm
                        </motion.button>
                    </div>
                </header>

                {/* Stats */}
                <motion.section className="mb-10" variants={staggerContainer} initial="initial" animate="animate">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div className="bg-charcoal text-white p-6 rounded-[2rem]" variants={staggerItem}>
                            <span className="material-symbols-outlined text-primary text-2xl mb-3">inventory_2</span>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">Tổng sản phẩm</p>
                            <p className="text-4xl font-black italic text-primary">{totalCount}</p>
                        </motion.div>
                        <motion.div className="bg-white p-6 rounded-[2rem] border border-border-light" variants={staggerItem}>
                            <span className="material-symbols-outlined text-blue-500 text-2xl mb-3">store</span>
                            <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">Stores có thể gán</p>
                            <p className="text-4xl font-black italic">{stores.length}</p>
                        </motion.div>
                        <motion.div className="bg-primary p-6 rounded-[2rem] border-2 border-charcoal" variants={staggerItem}>
                            <span className="material-symbols-outlined text-charcoal text-2xl mb-3">category</span>
                            <p className="text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1">Trang hiện tại</p>
                            <p className="text-4xl font-black italic text-charcoal">{page}/{totalPages}</p>
                        </motion.div>
                    </div>
                </motion.section>

                {/* ===== COLOR MANAGEMENT PANEL ===== */}
                <AnimatePresence>
                    {showColorManager && (
                        <motion.section className="mb-10" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="bg-white rounded-[2rem] border border-border-light p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl">palette</span>
                                        <div>
                                            <h3 className="text-lg font-black uppercase italic tracking-tight">Quản Lý <span className="text-primary">Màu Sắc</span></h3>
                                            <p className="text-[10px] font-bold opacity-40">Tạo các màu có sẵn để dùng khi tạo SKU</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowColorManager(false)} className="size-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>

                                {/* Add Color Form */}
                                <form onSubmit={handleAddColor} className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-40">Tên màu</label>
                                        <input value={newColorName} onChange={(e) => setNewColorName(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary"
                                            placeholder="VD: Black, Red, Navy Blue..." />
                                    </div>
                                    <div className="w-40">
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-40">Mã màu</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={newColorCode} onChange={(e) => setNewColorCode(e.target.value)}
                                                className="size-10 rounded-lg border-2 border-gray-200 cursor-pointer" />
                                            <input value={newColorCode} onChange={(e) => setNewColorCode(e.target.value)}
                                                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-primary"
                                                placeholder="#000000" />
                                        </div>
                                    </div>
                                    <motion.button type="submit" disabled={addingColor || !newColorName.trim()}
                                        className="px-5 py-2.5 bg-primary text-charcoal rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-charcoal hover:text-white transition-colors disabled:opacity-40 flex items-center gap-1.5"
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        {addingColor ? 'Đang tạo...' : 'Thêm màu'}
                                    </motion.button>
                                </form>

                                {/* Color Grid */}
                                {colors.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-2xl">
                                        <span className="material-symbols-outlined text-4xl opacity-20 mb-2">palette</span>
                                        <p className="text-xs font-bold opacity-40">Chưa có màu nào. Thêm màu ở form phía trên!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {colors.map(c => {
                                            const cid = c._id || c.id;
                                            const isEditing = (editingColor?._id || editingColor?.id) === cid;
                                            return (
                                                <motion.div key={cid}
                                                    className={`p-3 rounded-2xl border-2 transition-all ${isEditing ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 bg-white hover:border-primary/40'}`}
                                                    whileHover={{ y: -2 }}>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <input value={editColorName} onChange={(e) => setEditColorName(e.target.value)}
                                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] font-bold" />
                                                            <div className="flex gap-1.5">
                                                                <input type="color" value={editColorCode} onChange={(e) => setEditColorCode(e.target.value)}
                                                                    className="size-7 rounded border border-gray-200 cursor-pointer" />
                                                                <input value={editColorCode} onChange={(e) => setEditColorCode(e.target.value)}
                                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[9px] font-mono" />
                                                            </div>
                                                            <div className="flex gap-1.5">
                                                                <button onClick={handleUpdateColor} className="flex-1 py-1.5 bg-primary text-charcoal rounded-lg text-[9px] font-black uppercase">Lưu</button>
                                                                <button onClick={() => setEditingColor(null)} className="px-2 py-1.5 bg-gray-100 rounded-lg text-[9px] font-black uppercase">Hủy</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="size-8 rounded-xl border-2 border-gray-200 shadow-inner" style={{ backgroundColor: c.code }}></div>
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => { setEditingColor(c); setEditColorName(c.name); setEditColorCode(c.code); }}
                                                                        className="size-6 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                                                                        <span className="material-symbols-outlined text-[12px]">edit</span>
                                                                    </button>
                                                                    <button onClick={() => handleDeleteColor(cid)} disabled={deletingColor === cid}
                                                                        className="size-6 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors disabled:opacity-30">
                                                                        <span className="material-symbols-outlined text-[12px]">delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs font-black uppercase truncate">{c.name}</p>
                                                            <p className="text-[9px] font-mono font-bold opacity-40">{c.code}</p>
                                                        </>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Flow guide */}
                <div className="mb-8 p-5 bg-charcoal rounded-2xl text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">📋 Hướng dẫn flow vận hành</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                        <span className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-primary text-sm">add_circle</span> 1. Tạo Product</span>
                        <span className="text-primary text-lg">→</span>
                        <span className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-primary text-sm">layers</span> 2. Tạo SKU (size/color)</span>
                        <span className="text-primary text-lg">→</span>
                        <span className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-primary text-sm">pin_drop</span> 3. Set inventory cho Store</span>
                        <span className="text-primary text-lg">→</span>
                        <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Xem tại Inventory page</span>
                    </div>
                </div>

                {/* Search */}
                <section className="mb-6">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30">search</span>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm theo tên, brand..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-border-light rounded-full text-xs font-bold focus:ring-2 focus:ring-primary" />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-charcoal text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-charcoal transition-colors">
                            Tìm
                        </button>
                    </form>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mr-1">Trạng thái:</span>
                        {([['active', 'Đang hiện'], ['inactive', 'Đã ẩn'], ['', 'Tất cả']] as const).map(([val, label]) => (
                            <button key={val} onClick={() => { setStatusFilter(val as any); setPage(1); }}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${statusFilter === val ? 'bg-charcoal text-white' : 'bg-gray-100 text-charcoal hover:bg-gray-200'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Product Table */}
                <section className="pb-20">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <motion.span className="material-symbols-outlined text-4xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-border-light">
                            <span className="material-symbols-outlined text-6xl opacity-20 mb-4">inbox</span>
                            <p className="font-black uppercase tracking-widest opacity-40">Không có sản phẩm nào</p>
                            <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-2 bg-primary text-charcoal rounded-full text-xs font-black uppercase">+ Tạo ngay</button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] border border-border-light overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-charcoal text-white">
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Ảnh</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Sản phẩm</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Brand</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Giá</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Hiển thị KH</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map((p: any) => {
                                            const pid = p.id || p._id;
                                            const img = p.images?.[0]?.url || '';
                                            const isInactive = p.status === 'inactive';
                                            return (
                                                <tr key={pid} className={`transition-colors hover:bg-primary/5 ${isInactive ? 'bg-orange-50/40' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className={`size-14 rounded-xl bg-gray-50 border overflow-hidden flex items-center justify-center flex-shrink-0 ${isInactive ? 'border-orange-200' : 'border-gray-200'}`}>
                                                            {img ? (
                                                                <img src={img} alt={p.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-gray-300">image</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black uppercase text-sm">{p.name}</p>
                                                            {isInactive && (
                                                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[8px] font-black uppercase leading-none flex-shrink-0">
                                                                    Ẩn KH
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] opacity-40 truncate max-w-[200px]">{p.description || '—'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase">{p.brand}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-black text-lg text-primary">{formatPrice(p.price)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {/* Toggle: controls customer visibility only */}
                                                        <button
                                                            onClick={() => handleToggleStatus(pid, p.status)}
                                                            disabled={togglingStatus === pid}
                                                            className="flex items-center gap-2.5 group cursor-pointer disabled:opacity-50"
                                                            title={isInactive ? 'Bật hiển thị cho khách hàng' : 'Ẩn khỏi khách hàng (vẫn hiện ở Admin)'}
                                                        >
                                                            <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isInactive ? 'bg-gray-300' : 'bg-green-500'}`}>
                                                                <div className={`absolute top-1 size-4 rounded-full bg-white shadow-md transition-all duration-300 ${isInactive ? 'left-1' : 'left-[22px]'}`}></div>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`text-[9px] font-black uppercase leading-tight ${isInactive ? 'text-orange-500' : 'text-green-600'}`}>
                                                                    {togglingStatus === pid ? '...' : (isInactive ? 'Ẩn KH' : 'Hiện KH')}
                                                                </span>
                                                                <span className="text-[8px] font-bold opacity-30 leading-tight">
                                                                    {isInactive ? 'Khách không thấy' : 'Khách nhìn thấy'}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <motion.button onClick={() => setSkuProduct(p)}
                                                                className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                title="Quản lý SKU & Inventory">
                                                                <span className="material-symbols-outlined text-[14px]">settings</span>
                                                                SKU
                                                            </motion.button>
                                                            <motion.button onClick={() => { setEditProduct(p); setShowForm(true); }}
                                                                className="px-3 py-1.5 bg-primary/20 text-charcoal rounded-lg text-[10px] font-black uppercase hover:bg-primary transition-colors flex items-center gap-1"
                                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <span className="material-symbols-outlined text-[14px]">edit</span>Sửa
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                                className="px-4 py-2 bg-white border border-border-light rounded-xl font-black text-xs disabled:opacity-30 hover:bg-primary/10 transition-colors">← Trước</button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                                    <button key={i + 1} onClick={() => setPage(i + 1)}
                                        className={`size-9 rounded-full font-black text-xs transition-colors ${page === i + 1 ? 'bg-primary text-charcoal' : 'bg-white border border-border-light hover:bg-primary/10'}`}>
                                        {i + 1}
                                    </button>
                                ))}
                                {totalPages > 5 && <span className="text-xs font-bold opacity-40">...</span>}
                            </div>
                            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                                className="px-4 py-2 bg-white border border-border-light rounded-xl font-black text-xs disabled:opacity-30 hover:bg-primary/10 transition-colors">Sau →</button>
                        </div>
                    )}
                </section>

                {/* Modals */}
                <AnimatePresence>
                    {showForm && (
                        <ProductFormModal product={editProduct} onClose={() => { setShowForm(false); setEditProduct(null); }} onSaved={handleFormSaved} />
                    )}
                    {skuProduct && (
                        <SKUInventoryModal product={skuProduct} stores={stores} colors={colors} onClose={() => setSkuProduct(null)} />
                    )}
                </AnimatePresence>
            </AdminLayout>
        </motion.div>
    );
};

export default AdminProductsPage;
