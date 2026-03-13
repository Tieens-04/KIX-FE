import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ProductGrid from '../components/ProductGrid';
import { fadeInUp, fadeInLeft, staggerContainer, staggerItem, pageTransition } from '../utils/animations';
import { productApi } from '../services/productApi';
import { colorApi } from '../services/colorApi';
import { Color } from '../types';

const SneakersPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('');

    // Dynamic filter options from API
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<number[]>([]);

    // Price range filter
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 }); // full range from API
    const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 10000000 });
    const priceRangeLoaded = useRef(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    // Apply theme to document
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

    // Fetch colors, sizes, and price range on mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [colorsRes, sizesRes, priceRes] = await Promise.all([
                    colorApi.getAll(),
                    productApi.getSizes(),
                    productApi.getPriceRange(),
                ]);
                setColors(colorsRes.data || []);
                setSizes(sizesRes.data || []);

                const prData = priceRes.data;
                if (prData) {
                    const range = { min: prData.minPrice, max: prData.maxPrice };
                    setPriceRange(range);
                    setSelectedPriceRange(range);
                    priceRangeLoaded.current = true;
                }
            } catch (err) {
                console.error('Failed to fetch filter options', err);
            }
        };
        fetchFilterOptions();
    }, []);

    // Check if price filter is active (different from full range)
    const isPriceFiltered = priceRangeLoaded.current &&
        (selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max);

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params: any = {
                    page,
                    limit: 12,
                    search: searchQuery || undefined,
                    sort: sort || undefined,
                };
                if (selectedColor) params.color = selectedColor;
                if (selectedSize) params.size = Number(selectedSize);
                if (isPriceFiltered) {
                    params.minPrice = selectedPriceRange.min;
                    params.maxPrice = selectedPriceRange.max;
                }

                const res = await productApi.getAll(params);
                const apiProducts = (res.data || []).map((p: any, i: number) => ({
                    id: p._id || p.id || i,
                    name: p.name,
                    category: p.category || p.brand || 'Sneaker',
                    color: p.colorway || '',
                    price: p.price,
                    originalPrice: p.oldPrice,
                    image: p.images?.[0]?.url || p.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
                    badge: p.isHot ? 'Hot' : p.isFeatured ? 'Featured' : undefined,
                    badgeColor: p.isHot ? 'bg-red-600' : 'bg-charcoal',
                    featured: i === 0 && page === 1,
                    soldOut: p.isSoldOut || p.status === 'inactive',
                }));
                setProducts(apiProducts);
                setTotalCount(res.meta?.totalCount || apiProducts.length);
            } catch (err) {
                console.error('Failed to fetch products, using fallback', err);
            }
            setLoading(false);
        };
        fetchProducts();
    }, [page, sort, selectedColor, selectedSize, selectedPriceRange]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleAISearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;
        setPage(1);
        setLoading(true);
        try {
            const params: any = {
                page: 1,
                limit: 12,
                search: searchQuery,
            };
            if (selectedColor) params.color = selectedColor;
            if (selectedSize) params.size = Number(selectedSize);
            if (isPriceFiltered) {
                params.minPrice = selectedPriceRange.min;
                params.maxPrice = selectedPriceRange.max;
            }

            const res = await productApi.getAll(params);
            const apiProducts = (res.data || []).map((p: any, i: number) => ({
                id: p._id || p.id || i,
                name: p.name,
                category: p.category || p.brand || 'Sneaker',
                color: p.colorway || '',
                price: p.price,
                image: p.images?.[0]?.url || p.imageUrl || '',
                featured: i === 0,
                soldOut: p.isSoldOut,
            }));
            setProducts(apiProducts);
            setTotalCount(res.meta?.totalCount || apiProducts.length);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleResetFilters = () => {
        setSelectedColor('');
        setSelectedSize('');
        setSelectedPriceRange(priceRange);
        setSearchQuery('');
        setSort('');
        setPage(1);
    };

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleAddToCart = (product: any) => {
        showToast(`'${product.name}' added to your box!`);
    };

    const formatPrice = (val: number) => val.toLocaleString('en-US') + 'đ';

    // Active filter count for badge
    const activeFilterCount = (selectedColor ? 1 : 0) + (selectedSize ? 1 : 0) + (isPriceFiltered ? 1 : 0);

    return (
        <motion.div
            className="min-h-screen bg-background-light dark:bg-background-dark"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
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
                        <div className="bg-primary text-charcoal px-6 py-4 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(37,244,37,0.3)]">
                            <div className="size-8 bg-charcoal text-primary rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm font-bold">shopping_cart</span>
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

            <div className="flex pt-16">
                {/* Sidebar */}
                <Sidebar
                    selectedSize={selectedSize}
                    setSelectedSize={(size) => { setSelectedSize(size); setPage(1); }}
                    selectedColor={selectedColor}
                    setSelectedColor={(color) => { setSelectedColor(color); setPage(1); }}
                    colors={colors}
                    sizes={sizes}
                    priceRange={priceRange}
                    selectedPriceRange={selectedPriceRange}
                    setSelectedPriceRange={(range) => { setSelectedPriceRange(range); setPage(1); }}
                    onReset={handleResetFilters}
                />

                {/* Main Content */}
                <main className="flex-1 lg:ml-72 pb-20 px-6 md:px-10 max-w-[1440px]">
                    <motion.div
                        className="py-12 relative"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {/* Page Header */}
                        <motion.div className="mb-16 relative" variants={fadeInUp}>
                            <motion.div
                                className="inline-flex items-center gap-2 bg-primary px-3 py-1 rounded-sm mb-6 shadow-[4px_4px_0px_#111811]"
                                variants={staggerItem}
                            >
                                <span className="text-charcoal font-black tracking-[0.2em] uppercase text-[10px]">Sneakers Hub</span>
                            </motion.div>
                            <motion.h1
                                className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter mb-4 uppercase italic"
                                variants={staggerItem}
                            >
                                New<br />
                                <span className="text-primary" style={{ WebkitTextStroke: '2px #111811', paintOrder: 'stroke fill' }}>Arrivals</span>
                            </motion.h1>
                            <motion.p
                                className="text-xl font-bold opacity-80 max-w-xl leading-snug"
                                variants={staggerItem}
                            >
                                The world's most curated sneaker inventory. Refined by style, built for the streets.
                            </motion.p>
                        </motion.div>

                        {/* Active Filters Bar */}
                        <AnimatePresence>
                            {activeFilterCount > 0 && (
                                <motion.div
                                    className="flex flex-wrap items-center gap-3 mb-8"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Filters:</span>
                                    {selectedColor && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={() => { setSelectedColor(''); setPage(1); }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-charcoal dark:text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-primary/20 transition-colors group"
                                        >
                                            <span
                                                className="size-3 rounded-full border border-charcoal/20"
                                                style={{ backgroundColor: colors.find(c => c.name === selectedColor)?.code || '#888' }}
                                            ></span>
                                            Color: {selectedColor}
                                            <span className="material-symbols-outlined text-[10px] opacity-50 group-hover:opacity-100">close</span>
                                        </motion.button>
                                    )}
                                    {selectedSize && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={() => { setSelectedSize(''); setPage(1); }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-charcoal dark:text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-primary/20 transition-colors group"
                                        >
                                            Size: {selectedSize}
                                            <span className="material-symbols-outlined text-[10px] opacity-50 group-hover:opacity-100">close</span>
                                        </motion.button>
                                    )}
                                    {isPriceFiltered && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={() => { setSelectedPriceRange(priceRange); setPage(1); }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-charcoal dark:text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-primary/20 transition-colors group"
                                        >
                                            Price: {formatPrice(selectedPriceRange.min)} - {formatPrice(selectedPriceRange.max)}
                                            <span className="material-symbols-outlined text-[10px] opacity-50 group-hover:opacity-100">close</span>
                                        </motion.button>
                                    )}
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Collection Section */}
                        <section className="mb-32" id="cards">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">The Collection</h2>
                                    <div className="h-[2px] w-24 bg-charcoal/10 dark:bg-white/10 hidden md:block"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-charcoal dark:border-white">{totalCount} Results</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Sort By:</span>
                                    <select
                                        className="border-none bg-transparent text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer dark:text-white"
                                        value={sort}
                                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                                    >
                                        <option value="">Latest Drops</option>
                                        <option value="-price">Price: High to Low</option>
                                        <option value="price">Price: Low to High</option>
                                        <option value="-createdAt">Newest</option>
                                    </select>
                                </div>
                            </div>

                            {/* Product Grid */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <motion.span className="material-symbols-outlined text-4xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                </div>
                            ) : products.length > 0 ? (
                                <ProductGrid products={products} onAddToCart={handleAddToCart} />
                            ) : (
                                <div className="text-center py-20">
                                    <span className="material-symbols-outlined text-6xl opacity-20 mb-4">search_off</span>
                                    <p className="font-black uppercase tracking-widest opacity-40">Không tìm thấy sản phẩm</p>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={handleResetFilters}
                                            className="mt-4 px-6 py-2 bg-primary text-charcoal text-xs font-black uppercase tracking-widest rounded-full hover:shadow-lg transition-all"
                                        >
                                            Reset Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </section>
                    </motion.div>

                    {/* Footer */}
                    <Footer />
                </main>
            </div>
        </motion.div>
    );
};

export default SneakersPage;
