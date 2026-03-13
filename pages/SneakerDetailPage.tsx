import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { navigateWithTransition } from '../components/PageTransition';
import { productApi } from '../services/productApi';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../context/AuthContext';
import { fadeInUp, staggerContainer, staggerItem, pageTransition, scaleIn } from '../utils/animations';

const colorNameToHex: Record<string, string> = {
    red: '#EF4444', blue: '#3B82F6', green: '#22C55E', yellow: '#EAB308',
    orange: '#F97316', purple: '#A855F7', pink: '#EC4899', black: '#111111',
    white: '#FFFFFF', gray: '#6B7280', grey: '#6B7280', brown: '#92400E',
    navy: '#1E3A5F', beige: '#D4C5A9', cream: '#FFFDD0', gold: '#D4AF37',
    silver: '#C0C0C0', maroon: '#800000', olive: '#808000', teal: '#14B8A6',
    coral: '#FF7F50', cyan: '#06B6D4', indigo: '#6366F1', violet: '#8B5CF6',
    tan: '#D2B48C', khaki: '#BDB76B', ivory: '#FFFFF0', lavender: '#E6E6FA',
    mint: '#98FF98', peach: '#FFCBA4', salmon: '#FA8072', turquoise: '#40E0D0',
    burgundy: '#800020', charcoal: '#36454F', champagne: '#F7E7CE',
    'sail': '#F5F0E1', 'university red': '#CD1141', 'wolf grey': '#909499',
};

const getColorHex = (colorName: string): string => {
    const lower = colorName.toLowerCase().trim();
    if (colorNameToHex[lower]) return colorNameToHex[lower];
    // Generate a deterministic color from string hash for unknown colors
    let hash = 0;
    for (let i = 0; i < lower.length; i++) hash = lower.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash) % 360}, 60%, 50%)`;
};

const SneakerDetailPage: React.FC = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const [skus, setSkus] = useState<any[]>([]);
    const [availability, setAvailability] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    // Get product ID from URL
    const productId = window.location.pathname.split('/sneakers/')[1];

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Fetch product details
    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await productApi.getById(productId);
                setProduct(res.data.product);
                setSkus(res.data.skus || []);
                setAvailability(res.data.availability || []);

                // Auto-select first available size & color
                if (res.data.skus?.length > 0) {
                    const firstSku = res.data.skus[0];
                    setSelectedSize(String(firstSku.size));
                    setSelectedColor(firstSku.color);
                }
            } catch (err) {
                console.error('Failed to fetch product', err);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        if (!productId) return;
        const fetchReviews = async () => {
            try {
                const res: any = await productApi.getReviews(productId);
                setReviews(res.data || []);
            } catch (err) {
                console.error('Failed to fetch reviews', err);
            }
        };
        fetchReviews();
    }, [productId]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleAISearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;
        navigateWithTransition(`/sneakers?search=${encodeURIComponent(searchQuery)}`);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Get unique sizes and colors
    const uniqueSizes = [...new Set(skus.map(s => String(s.size)))].sort((a: string, b: string) => parseFloat(a) - parseFloat(b));
    const uniqueColors = [...new Set(skus.map(s => s.color))] as string[];

    // Get selected SKU
    const selectedSku = skus.find(s => String(s.size) === selectedSize && s.color === selectedColor);

    // Check availability for selected SKU
    // API returns availability grouped by store: [{ store_id, store_name, skus: [{ sku_id, size, color, quantity }] }]
    const getSkuAvailability = (sku: any) => {
        if (!sku) return [];
        const skuId = String(sku._id || sku.id);
        const results: any[] = [];
        for (const store of availability) {
            const matchingSku = (store.skus || []).find((s: any) => {
                const sSkuId = String(s.sku_id?._id || s.sku_id?.id || s.sku_id);
                return sSkuId === skuId && s.quantity > 0;
            });
            if (matchingSku) {
                results.push({
                    store_id: store.store_id,
                    store_name: store.store_name,
                    store_address: store.store_address,
                    quantity: matchingSku.quantity,
                });
            }
        }
        return results;
    };

    const skuAvailability = getSkuAvailability(selectedSku);
    const isInStock = skuAvailability.length > 0;
    const totalStock = skuAvailability.reduce((sum: number, a: any) => sum + (a.quantity || 0), 0);

    const handleAddToCart = async () => {
        if (!user) {
            navigateWithTransition('/login');
            return;
        }
        if (!selectedSku) {
            showToast('Vui lòng chọn size và màu sắc', 'error');
            return;
        }
        if (!isInStock) {
            showToast('Sản phẩm đã hết hàng', 'error');
            return;
        }

        setAddingToCart(true);
        try {
            const storeId = skuAvailability[0]?.store_id;
            await cartApi.addItem({
                product_id: product._id || product.id,
                sku_id: selectedSku._id || selectedSku.id,
                store_id: storeId,
                quantity,
                price: product.price,
            });
            showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
        } catch (err: any) {
            showToast(err?.message || 'Không thể thêm vào giỏ hàng', 'error');
        }
        setAddingToCart(false);
    };

    const handleSubmitReview = async () => {
        if (!user) {
            navigateWithTransition('/login');
            return;
        }
        if (!reviewText.trim()) {
            showToast('Vui lòng nhập nội dung đánh giá', 'error');
            return;
        }
        
        setSubmittingReview(true);
        try {
            if (editingReviewId) {
                await productApi.updateReview(productId, editingReviewId, { rating: reviewRating, comment: reviewText });
                showToast('Đã cập nhật đánh giá thành công', 'success');
                setEditingReviewId(null);
            } else {
                await productApi.addReview(productId, { rating: reviewRating, comment: reviewText });
                showToast('Đã gửi đánh giá thành công', 'success');
            }
            setReviewText('');
            setReviewRating(5);
            
            const res: any = await productApi.getReviews(productId);
            setReviews(res.data || []);
        } catch (err: any) {
            showToast(err?.response?.data?.message || err?.message || 'Không thể gửi đánh giá', 'error');
        }
        setSubmittingReview(false);
    };

    const handleEditReview = (review: any) => {
        setReviewRating(review.rating);
        setReviewText(review.comment);
        setEditingReviewId(review._id);
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;
        try {
            await productApi.deleteReview(productId, reviewId);
            showToast('Đã xóa đánh giá', 'success');
            const res: any = await productApi.getReviews(productId);
            setReviews(res.data || []);
        } catch (err: any) {
            showToast(err?.response?.data?.message || err?.message || 'Không thể xóa đánh giá', 'error');
        }
    };

    const productImages = product?.images?.length > 0
        ? product.images.map((img: any) => img.url)
        : product?.imageUrl
            ? [product.imageUrl]
            : ['https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo'];

    if (loading) {
        return (
            <motion.div
                className="min-h-screen bg-background-light dark:bg-background-dark"
                initial="initial" animate="animate" exit="exit" variants={pageTransition}
            >
                <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleAISearch={handleAISearch} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isHomePage={false} />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.span className="material-symbols-outlined text-5xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                        <p className="font-black uppercase tracking-widest text-sm opacity-40">Loading sneaker...</p>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    if (!product) {
        return (
            <motion.div
                className="min-h-screen bg-background-light dark:bg-background-dark"
                initial="initial" animate="animate" exit="exit" variants={pageTransition}
            >
                <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleAISearch={handleAISearch} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isHomePage={false} />
                <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
                    <span className="material-symbols-outlined text-8xl opacity-20">search_off</span>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Sneaker Not Found</h2>
                    <button
                        onClick={() => navigateWithTransition('/sneakers')}
                        className="bg-primary text-charcoal font-black py-3 px-8 rounded-full text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                    >
                        Back to Collection
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-background-light dark:bg-background-dark"
            initial="initial" animate="animate" exit="exit" variants={pageTransition}
        >
            {/* Toast Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        className="fixed bottom-8 right-8 z-[100]"
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <div className={`${toast.type === 'success' ? 'bg-primary text-charcoal' : 'bg-red-500 text-white'} px-6 py-4 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(37,244,37,0.3)]`}>
                            <div className={`size-8 ${toast.type === 'success' ? 'bg-charcoal text-primary' : 'bg-white text-red-500'} rounded-full flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-sm font-bold">
                                    {toast.type === 'success' ? 'check' : 'error'}
                                </span>
                            </div>
                            <p className="font-bold text-sm">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleAISearch={handleAISearch}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                isHomePage={false}
            />

            <main className="pt-20 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto">
                {/* Breadcrumb */}
                <motion.nav
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50 mb-10 pt-4"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                >
                    <button onClick={() => navigateWithTransition('/')} className="hover:text-primary transition-colors hover:opacity-100">Home</button>
                    <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                    <button onClick={() => navigateWithTransition('/sneakers')} className="hover:text-primary transition-colors hover:opacity-100">Sneakers</button>
                    <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                    <span className="text-primary opacity-100">{product.name}</span>
                </motion.nav>

                {/* Product Section */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 mb-20"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Image Gallery */}
                    <motion.div className="space-y-4" variants={fadeInUp}>
                        {/* Main Image */}
                        <motion.div
                            className="relative aspect-square bg-background-alt dark:bg-card-dark rounded-[3rem] overflow-hidden border-2 border-gray-100 dark:border-border-dark group"
                            layoutId={`product-image-${productId}`}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImage}
                                    src={productImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-12 group-hover:scale-105 transition-transform duration-700"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                />
                            </AnimatePresence>

                            {/* Badges */}
                            {product.isHot && (
                                <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase italic tracking-widest shadow-lg">
                                    🔥 Hot Deal
                                </div>
                            )}
                            {product.isFeatured && (
                                <div className="absolute top-6 left-6 bg-primary text-charcoal text-[10px] font-black px-4 py-2 rounded-full uppercase italic tracking-widest shadow-lg">
                                    ⭐ Featured
                                </div>
                            )}
                            {product.isSoldOut && (
                                <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center backdrop-blur-sm">
                                    <div className="border-4 border-white text-white font-black text-2xl uppercase tracking-widest px-10 py-4 rounded-full rotate-[-12deg]">
                                        Sold Out
                                    </div>
                                </div>
                            )}

                            {/* Favorite Button */}
                            <button className="absolute top-6 right-6 size-14 rounded-full bg-white/90 dark:bg-charcoal/90 shadow-xl flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl hover:text-red-500 transition-colors">favorite</span>
                            </button>

                            {/* Image navigation arrows */}
                            {productImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === 0 ? productImages.length - 1 : prev - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/90 dark:bg-charcoal/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === productImages.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/90 dark:bg-charcoal/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </>
                            )}
                        </motion.div>

                        {/* Thumbnail Gallery */}
                        {productImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {productImages.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 size-20 md:size-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === idx
                                            ? 'border-primary shadow-[0_0_20px_rgba(37,244,37,0.3)] scale-105'
                                            : 'border-gray-200 dark:border-border-dark opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div className="space-y-8" variants={fadeInUp}>
                        {/* Category & Brand Tag */}
                        <motion.div className="flex items-center gap-3 flex-wrap" variants={staggerItem}>
                            {product.brand && (
                                <span className="bg-primary text-charcoal text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[4px_4px_0px_#111811]">
                                    {product.brand}
                                </span>
                            )}
                            {product.category && (
                                <span className="border-2 border-charcoal dark:border-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                    {product.category}
                                </span>
                            )}
                            {isInStock ? (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                    <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Còn hàng ({totalStock})
                                </span>
                            ) : selectedSku ? (
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                    Hết hàng
                                </span>
                            ) : null}
                        </motion.div>

                        {/* Product Name */}
                        <motion.div variants={staggerItem}>
                            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] mb-3">
                                {product.name}
                            </h1>
                            {product.colorway && (
                                <p className="text-lg font-bold opacity-40 uppercase tracking-widest">{product.colorway}</p>
                            )}
                        </motion.div>

                        {/* Price */}
                        <motion.div className="flex items-end gap-4" variants={staggerItem}>
                            <span className="text-6xl font-black text-primary">${product.price}</span>
                            {product.oldPrice && (
                                <>
                                    <span className="text-2xl font-bold opacity-30 line-through mb-1">${product.oldPrice}</span>
                                    <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase mb-2">
                                        -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                                    </span>
                                </>
                            )}
                        </motion.div>

                        {/* Divider */}
                        <div className="h-[2px] bg-gray-100 dark:bg-border-dark"></div>

                        {/* Color Selection */}
                        {uniqueColors.length > 0 && (
                            <motion.div variants={staggerItem}>
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 block mb-4">
                                    Color — <span className="text-primary opacity-100">{selectedColor}</span>
                                </label>
                                <div className="flex gap-3 flex-wrap items-center">
                                    {uniqueColors.map(color => {
                                        const hex = getColorHex(color);
                                        const isWhite = color.toLowerCase() === 'white' || color.toLowerCase() === 'ivory' || color.toLowerCase() === 'cream';
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                title={color}
                                                className={`size-9 rounded-full transition-all duration-300 relative flex items-center justify-center ${selectedColor === color
                                                    ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-charcoal scale-110 shadow-[0_0_12px_rgba(37,244,37,0.3)]'
                                                    : 'hover:scale-110 hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                                                    } ${isWhite ? 'border border-gray-300 dark:border-border-dark' : ''}`}
                                                style={{ backgroundColor: hex }}
                                            >
                                                {selectedColor === color && (
                                                    <span className={`material-symbols-outlined text-sm ${isWhite ? 'text-gray-800' : 'text-white'}`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>check</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Size Selection */}
                        {uniqueSizes.length > 0 && (
                            <motion.div variants={staggerItem}>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
                                        Size (US) — <span className="text-primary opacity-100">{selectedSize}</span>
                                    </label>
                                    <button onClick={() => setShowSizeGuide(true)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                        Size Guide
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {uniqueSizes.map(size => {
                                        const sizeSkus = skus.filter(s => String(s.size) === size && s.color === selectedColor);
                                        const hasSku = sizeSkus.length > 0;
                                        const sizeAvailable = hasSku && getSkuAvailability(sizeSkus[0]).length > 0;

                                        return (
                                            <button
                                                key={size}
                                                onClick={() => hasSku && setSelectedSize(size)}
                                                disabled={!hasSku}
                                                className={`py-3 rounded-xl text-sm font-black transition-all duration-300 relative
                                                    ${selectedSize === size
                                                        ? 'bg-primary text-charcoal shadow-[0_0_20px_rgba(37,244,37,0.3)] scale-105'
                                                        : hasSku
                                                            ? 'bg-gray-100 dark:bg-card-dark border border-gray-200 dark:border-border-dark hover:border-primary'
                                                            : 'bg-gray-50 dark:bg-charcoal opacity-30 cursor-not-allowed line-through'
                                                    }
                                                `}
                                            >
                                                {size}
                                                {hasSku && !sizeAvailable && (
                                                    <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Quantity */}
                        <motion.div variants={staggerItem}>
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 block mb-4">Quantity</label>
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-card-dark rounded-2xl w-fit p-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="size-12 rounded-xl flex items-center justify-center hover:bg-white dark:hover:bg-charcoal transition-colors font-black text-lg"
                                >
                                    −
                                </button>
                                <span className="w-14 text-center font-black text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(totalStock || 10, quantity + 1))}
                                    className="size-12 rounded-xl flex items-center justify-center hover:bg-white dark:hover:bg-charcoal transition-colors font-black text-lg"
                                >
                                    +
                                </button>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div className="flex gap-4 pt-4" variants={staggerItem}>
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.isSoldOut}
                                className={`flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-xl
                                    ${product.isSoldOut
                                        ? 'bg-gray-200 dark:bg-border-dark text-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-charcoal hover:shadow-[0_0_40px_rgba(37,244,37,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {addingToCart ? (
                                    <motion.span className="material-symbols-outlined" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                ) : product.isSoldOut ? (
                                    <>
                                        <span className="material-symbols-outlined">notifications</span>
                                        Notify Me
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-black">shopping_cart</span>
                                        Add to Cart — ${(product.price * quantity).toFixed(2)}
                                    </>
                                )}
                            </button>

                            <button className="size-16 rounded-2xl border-2 border-gray-200 dark:border-border-dark flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                                <span className="material-symbols-outlined text-2xl">share</span>
                            </button>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div className="grid grid-cols-3 gap-4 pt-4" variants={staggerItem}>
                            {[
                                { icon: 'verified', text: '100% Authentic' },
                                { icon: 'local_shipping', text: 'Free Shipping' },
                                { icon: 'autorenew', text: 'Easy Returns' },
                            ].map((badge) => (
                                <div key={badge.icon} className="flex flex-col items-center gap-2 py-4 bg-gray-50 dark:bg-card-dark rounded-2xl">
                                    <span className="material-symbols-outlined text-primary text-2xl">{badge.icon}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-center opacity-60">{badge.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Product Details Tabs */}
                <motion.div
                    className="mb-20"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Tab Headers */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-card-dark rounded-2xl p-1.5 mb-8 w-fit">
                        {(['description', 'details', 'reviews'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
                                    ${activeTab === tab
                                        ? 'bg-primary text-charcoal shadow-md'
                                        : 'hover:bg-white dark:hover:bg-charcoal'
                                    }`}
                            >
                                {tab === 'description' ? 'Mô tả' : tab === 'details' ? 'Chi tiết' : 'Đánh giá'}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-card-dark rounded-[2rem] border border-gray-100 dark:border-border-dark p-8 md:p-12"
                        >
                            {activeTab === 'description' && (
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-lg leading-relaxed opacity-80">
                                        {product.description || `Khám phá ${product.name} — thiết kế đỉnh cao kết hợp công nghệ tiên tiến và phong cách đường phố độc đáo. Đôi giày này mang đến sự thoải mái tối ưu với đế cushion cao cấp, phù hợp cho mọi hoạt động từ thể thao đến dạo phố.`}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                        {[
                                            { icon: 'air', title: 'Đế Air Cushion', desc: 'Công nghệ đệm khí cho cảm giác êm ái' },
                                            { icon: 'recycling', title: 'Chất liệu bền vững', desc: 'Sản xuất từ nguyên liệu thân thiện môi trường' },
                                            { icon: 'palette', title: 'Phối màu độc quyền', desc: 'Bảng màu được thiết kế riêng biệt' },
                                            { icon: 'workspace_premium', title: 'Premium Quality', desc: 'Chất lượng cao cấp, bền bỉ theo thời gian' },
                                        ].map(feature => (
                                            <div key={feature.icon} className="flex gap-4 items-start p-5 bg-gray-50 dark:bg-charcoal rounded-2xl">
                                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-primary">{feature.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm uppercase tracking-wide mb-1">{feature.title}</h4>
                                                    <p className="text-xs opacity-50">{feature.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Thông tin chi tiết</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Tên sản phẩm', value: product.name },
                                            { label: 'Thương hiệu', value: product.brand || 'N/A' },
                                            { label: 'Danh mục', value: product.category || 'Sneaker' },
                                            { label: 'Phối màu', value: product.colorway || 'N/A' },
                                            { label: 'Giá', value: `$${product.price}` },
                                            { label: 'Trạng thái', value: product.status === 'active' ? 'Đang bán' : product.status || 'N/A' },
                                            { label: 'Số lượng SKU', value: String(skus.length) },
                                            { label: 'Số cửa hàng có hàng', value: String(skuAvailability.length) },
                                        ].map((detail, i) => (
                                            <div key={i} className="flex justify-between items-center py-4 px-5 bg-gray-50 dark:bg-charcoal rounded-xl">
                                                <span className="text-xs font-black uppercase tracking-widest opacity-40">{detail.label}</span>
                                                <span className="font-bold text-sm">{detail.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Available SKUs table */}
                                    {skus.length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">Phiên bản có sẵn</h4>
                                            <div className="bg-gray-50 dark:bg-charcoal rounded-2xl overflow-hidden">
                                                <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200 dark:border-border-dark">
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Size</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Color</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">SKU Code</span>
                                                </div>
                                                {skus.map((sku, i) => (
                                                    <div key={i} className="grid grid-cols-3 gap-4 p-4 border-b border-gray-100 dark:border-border-dark last:border-0 hover:bg-white dark:hover:bg-card-dark transition-colors">
                                                        <span className="font-bold text-sm">{sku.size}</span>
                                                        <span className="font-bold text-sm">{sku.color}</span>
                                                        <span className="font-mono text-xs opacity-50">{sku.sku_code}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-12">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Đánh giá sản phẩm ({reviews.length})</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-black text-primary">{product.rating ? Number(product.rating).toFixed(1) : '0.0'}</span>
                                            <div className="flex items-center text-primary">
                                                ★
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review List */}
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-16 bg-gray-50 dark:bg-charcoal rounded-3xl">
                                            <span className="material-symbols-outlined text-6xl opacity-10 mb-4 block">rate_review</span>
                                            <h4 className="text-lg font-black uppercase tracking-widest mb-2 opacity-50">Chưa có đánh giá</h4>
                                            <p className="text-sm opacity-40">Hãy là người đầu tiên đánh giá sản phẩm này.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {reviews.map((review, idx) => (
                                                <div key={idx} className="bg-gray-50 dark:bg-charcoal p-6 rounded-3xl border border-gray-100 dark:border-border-dark relative group">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center font-black text-charcoal shadow-lg">
                                                                {review.user_id?.name ? review.user_id.name[0].toUpperCase() : 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm tracking-wide">{review.user_id?.name || 'User'}</div>
                                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 text-primary">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>
                                                                    star
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm leading-relaxed opacity-80">{review.comment}</p>
                                                    
                                                    {user && review.user_id?._id === user.id && (
                                                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleEditReview(review)} className="size-8 rounded-full bg-white dark:bg-card-dark shadow-md flex items-center justify-center hover:text-primary transition-colors">
                                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                            </button>
                                                            <button onClick={() => handleDeleteReview(review._id)} className="size-8 rounded-full bg-white dark:bg-card-dark shadow-md flex items-center justify-center hover:text-red-500 transition-colors">
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add / Edit Review Form */}
                                    <div id="review-form" className="bg-white dark:bg-card-dark p-8 rounded-[2rem] border-2 border-gray-100 dark:border-border-dark shadow-xl">
                                        <h4 className="text-lg font-black uppercase italic tracking-tighter mb-6">
                                            {editingReviewId ? 'Sửa đánh giá' : 'Viết đánh giá của bạn'}
                                        </h4>
                                        <div className="mb-6 flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setReviewRating(star)}
                                                    className={`hover:scale-110 transition-transform ${star <= reviewRating ? 'text-primary' : 'text-gray-300 dark:text-border-dark'}`}
                                                >
                                                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        star
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                            className="w-full bg-gray-50 dark:bg-charcoal p-5 rounded-2xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors min-h-[120px] text-sm mb-6"
                                        ></textarea>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleSubmitReview}
                                                disabled={submittingReview}
                                                className="bg-primary text-charcoal font-black py-4 px-8 rounded-xl text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(37,244,37,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2"
                                            >
                                                {submittingReview ? 'Đang gửi...' : editingReviewId ? 'Cập nhật' : 'Gửi đánh giá'}
                                                {!submittingReview && <span className="material-symbols-outlined text-sm">send</span>}
                                            </button>
                                            {editingReviewId && (
                                                <button
                                                    onClick={() => {
                                                        setEditingReviewId(null);
                                                        setReviewText('');
                                                        setReviewRating(5);
                                                    }}
                                                    className="bg-gray-200 dark:bg-border-dark text-charcoal dark:text-white font-black py-4 px-8 rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
                                                >
                                                    Hủy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Back to Collection CTA */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <button
                        onClick={() => navigateWithTransition('/sneakers')}
                        className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all group"
                    >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-2 transition-transform">arrow_back</span>
                        Quay lại bộ sưu tập
                    </button>
                </motion.div>

                <Footer />
            </main>

            {/* Size Guide Modal */}
            <AnimatePresence>
                {showSizeGuide && (
                    <motion.div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)} />
                        <motion.div
                            className="relative bg-white dark:bg-card-dark rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-border-dark">
                                <h3 className="text-lg font-black uppercase tracking-widest">Size Guide</h3>
                                <button
                                    onClick={() => setShowSizeGuide(false)}
                                    className="size-10 rounded-full bg-gray-100 dark:bg-charcoal flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <img
                                    src="https://cdn.shopify.com/s/files/1/0004/5252/6146/files/sneaker-sizing-chart_new2103_b3860efa-b305-4473-8bb7-46f3a5b10282.png?v=1647819797"
                                    alt="Sneaker Size Guide"
                                    className="w-full h-auto rounded-2xl"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SneakerDetailPage;
