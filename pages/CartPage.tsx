import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { navigateWithTransition } from '../components/PageTransition';
import { fadeInUp, staggerContainer, staggerItem, pageTransition } from '../utils/animations';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../context/AuthContext';

// Cart items data
const CART_ITEMS = [
    {
        id: 1,
        name: 'VaporMax Flyknit',
        category: 'Performance',
        color: 'Volt Green',
        size: 'US 9.0',
        quantity: 1,
        price: 189.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
    },
    {
        id: 2,
        name: 'Dunk Low Pro',
        category: 'Skate Classic',
        color: 'Sky Blue',
        size: 'US 10.5',
        quantity: 2,
        price: 120.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20',
    },
    {
        id: 3,
        name: 'Air Max 270',
        category: 'Lifestyle',
        color: 'Triple White',
        size: 'US 9.0',
        quantity: 1,
        price: 144.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9t3YIuCIONp__ieTj-01FjNI4qKViScLPpye53fZMZ8z2gAnpA3WL2ug7H1JeHuUvz1V-zz2oECkFjwU_ztXWpJuezR1wS-8PjdpnmSCqPUqdrrISBqv3WiWgHNNyQqMm_tr-OROEVU5xiQmsP7sJRwlXuVUuWlPbozk5w6JTi9kGZV4A-QrDOou1PwpmBd31giLRbn9DmJdjdnTxtmcwmoh7iKYQMqrZCWAAp87PA9b9tXEdWVntZ6aJdS5qGzxmh1xY_A1HK9w',
    },
    {
        id: 4,
        name: 'Tech Runner X',
        category: 'Gorpcore',
        color: 'Grey Mist',
        size: 'US 11.0',
        quantity: 1,
        price: 210.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20',
    },
    {
        id: 5,
        name: 'Dunk High Retro',
        category: 'Vintage OG',
        color: 'Obsidian',
        size: 'US 8.5',
        quantity: 1,
        price: 165.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
    },
    {
        id: 6,
        name: 'Air Jordan 1 Low',
        category: 'Classic',
        color: 'Crimson Red',
        size: 'US 9.0',
        quantity: 1,
        price: 110.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
    },
    {
        id: 7,
        name: 'Nike Blazer Mid',
        category: 'Classic',
        color: 'White Leather',
        size: 'US 10.0',
        quantity: 1,
        price: 105.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9t3YIuCIONp__ieTj-01FjNI4qKViScLPpye53fZMZ8z2gAnpA3WL2ug7H1JeHuUvz1V-zz2oECkFjwU_ztXWpJuezR1wS-8PjdpnmSCqPUqdrrISBqv3WiWgHNNyQqMm_tr-OROEVU5xiQmsP7sJRwlXuVUuWlPbozk5w6JTi9kGZV4A-QrDOou1PwpmBd31giLRbn9DmJdjdnTxtmcwmoh7iKYQMqrZCWAAp87PA9b9tXEdWVntZ6aJdS5qGzxmh1xY_A1HK9w',
    },
];

interface CartItemDisplay {
    id: string;
    _id: string;
    name: string;
    category: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    image: string;
}

const CartPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState('');
    const { isAuthenticated } = useAuth();

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    // Apply theme
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

    // Fetch cart from API
    const fetchCart = async () => {
        if (!isAuthenticated) { setLoading(false); return; }
        try {
            const res = await cartApi.get();
            const items = (res.data?.items || []).map((item: any) => ({
                id: item.id || item._id,
                _id: item.id || item._id,
                name: item.product_id?.name || 'Product',
                category: item.product_id?.brand || item.product_id?.category || '',
                color: item.sku_id?.color || '',
                size: item.sku_id?.size ? `US ${item.sku_id.size}` : '',
                quantity: item.quantity,
                price: item.price,
                image: item.product_id?.images?.[0]?.url || item.product_id?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
            }));
            setCartItems(items);
        } catch (err) {
            console.error('Failed to fetch cart', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchCart(); }, [isAuthenticated]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleAISearch = (e?: React.FormEvent) => {
        e?.preventDefault();
    };

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const updateQuantity = async (itemId: string, delta: number) => {
        const item = cartItems.find(i => i._id === itemId);
        if (!item) return;
        const newQty = Math.max(1, item.quantity + delta);
        setUpdating(itemId);
        try {
            await cartApi.updateItem(itemId, newQty);
            setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity: newQty } : i));
        } catch (err: any) {
            showToast(err?.message || 'Error updating');
        }
        setUpdating('');
    };

    const removeItem = async (itemId: string, name: string) => {
        setUpdating(itemId);
        try {
            await cartApi.removeItem(itemId);
            setCartItems(prev => prev.filter(i => i._id !== itemId));
            showToast(`'${name}' đã xóa khỏi giỏ`);
        } catch (err: any) {
            showToast(err?.message || 'Error removing');
        }
        setUpdating('');
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <motion.div
            className="min-h-screen bg-background-light dark:bg-background-dark"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            {/* Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        className="fixed bottom-8 right-8 z-[100]"
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <div className="bg-red-500 text-white px-6 py-4 rounded-full flex items-center gap-4 shadow-lg">
                            <div className="size-8 bg-white text-red-500 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm font-bold">delete</span>
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

            <main className="pt-24 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto">
                {/* Page Title */}
                <motion.div
                    className="mb-10"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                >
                    <div className="flex items-center gap-6">
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Your Cart</h1>
                        <div className="h-[2px] flex-1 bg-charcoal/10 dark:bg-white/10"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-charcoal dark:border-white">
                            {totalItems} Items Secured
                        </span>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* Cart Items Table */}
                    <motion.div
                        className="lg:col-span-8 overflow-x-auto"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-charcoal dark:border-white text-left">
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40">Product</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40 px-4 text-center">Size</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40 px-4 text-center">Quantity</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40 px-4 text-right">Price</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40 pl-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <AnimatePresence>
                                    {cartItems.map((item, index) => (
                                        <motion.tr
                                            key={item.id}
                                            className="group"
                                            variants={staggerItem}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -100, height: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td className="py-6">
                                                <div className="flex items-center gap-4">
                                                    <motion.div
                                                        className="size-20 bg-gray-50 dark:bg-charcoal rounded-2xl overflow-hidden p-2 flex-shrink-0 border border-gray-100 dark:border-border-dark group-hover:border-primary transition-colors"
                                                        whileHover={{ scale: 1.05, rotate: -3 }}
                                                    >
                                                        <img
                                                            alt={item.name}
                                                            className="w-full h-full object-contain -rotate-12"
                                                            src={item.image}
                                                        />
                                                    </motion.div>
                                                    <div>
                                                        <h4 className="font-black uppercase italic tracking-tighter text-base">{item.name}</h4>
                                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                                                            {item.category} • {item.color}
                                                        </p>
                                                        <motion.button
                                                            className="mt-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 flex items-center gap-1"
                                                            onClick={() => removeItem(item._id, item.name)}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">delete</span> Remove
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 text-center">
                                                <span className="text-xs font-black bg-charcoal dark:bg-primary text-white dark:text-charcoal px-2 py-1 rounded">
                                                    {item.size}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <motion.button
                                                        className="size-8 rounded-lg bg-gray-100 dark:bg-charcoal flex items-center justify-center hover:bg-primary transition-colors"
                                                        onClick={() => updateQuantity(item._id, -1)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <span className="material-symbols-outlined text-sm font-black">remove</span>
                                                    </motion.button>
                                                    <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                                                    <motion.button
                                                        className="size-8 rounded-lg bg-gray-100 dark:bg-charcoal flex items-center justify-center hover:bg-primary transition-colors"
                                                        onClick={() => updateQuantity(item._id, 1)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <span className="material-symbols-outlined text-sm font-black">add</span>
                                                    </motion.button>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 text-right text-sm font-black">${item.price.toFixed(2)}</td>
                                            <td className="py-6 pl-4 text-right text-sm font-black italic">${(item.price * item.quantity).toFixed(2)}</td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {/* Free Shipping Banner */}
                        <motion.div
                            className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-card-dark p-6 rounded-3xl border border-dashed border-gray-300 dark:border-border-dark"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Free Express Shipping</p>
                                    <p className="text-[8px] font-bold opacity-40 uppercase">Delivery in 2-3 business days</p>
                                </div>
                            </div>
                            <a href="/sneakers" className="text-xs font-black uppercase tracking-widest hover:text-primary underline">
                                Continue Shopping
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        className="lg:col-span-4 sticky top-24"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-charcoal dark:bg-primary text-white dark:text-charcoal rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 size-40 bg-primary/20 dark:bg-charcoal/20 rounded-full blur-3xl"></div>

                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 relative z-10">Order Summary</h3>

                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex justify-between items-center text-xs font-bold text-white/60 dark:text-charcoal/60 uppercase tracking-widest">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span className="text-white dark:text-charcoal">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-white/60 dark:text-charcoal/60 uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-primary dark:text-charcoal uppercase">Calculated at next step</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-white/60 dark:text-charcoal/60 uppercase tracking-widest">
                                    <span>Tax</span>
                                    <span className="text-white dark:text-charcoal">$0.00</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 dark:border-charcoal/10 flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Estimated Total</span>
                                    <motion.span
                                        className="text-4xl font-black text-primary dark:text-charcoal italic leading-none"
                                        key={subtotal}
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1 }}
                                    >
                                        ${subtotal.toFixed(2)}
                                    </motion.span>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {/* Promo Code */}
                                <div className="relative">
                                    <input
                                        className="w-full bg-white/5 dark:bg-charcoal/10 border-2 border-white/10 dark:border-charcoal/20 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-primary focus:border-primary placeholder:text-white/20 dark:placeholder:text-charcoal/30"
                                        placeholder="PROMO CODE"
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary dark:text-charcoal font-black text-[10px] uppercase tracking-widest px-2 py-1 bg-white/10 dark:bg-charcoal/10 rounded hover:bg-white/20 dark:hover:bg-charcoal/20 transition-colors">
                                        Apply
                                    </button>
                                </div>

                                {/* Checkout Button */}
                                <motion.button
                                    onClick={() => navigateWithTransition('/payment')}
                                    className="w-full py-5 bg-primary dark:bg-charcoal text-charcoal dark:text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white dark:hover:bg-white hover:text-charcoal transition-all shadow-[0_10px_30px_rgba(37,244,37,0.3)] flex items-center justify-center gap-3"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Proceed to Checkout
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </motion.button>

                                {/* Payment Icons */}
                                <div className="flex items-center justify-center gap-4 py-4 opacity-40">
                                    <span className="material-symbols-outlined">payments</span>
                                    <span className="material-symbols-outlined">credit_card</span>
                                    <span className="material-symbols-outlined">shield</span>
                                </div>

                                {/* AI Recommendation */}
                                <motion.div
                                    className="p-4 bg-white/5 dark:bg-charcoal/10 rounded-2xl border border-white/10 dark:border-charcoal/20"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary dark:text-charcoal text-lg">auto_awesome</span>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">AI Recommendation</p>
                                            <p className="text-[9px] font-bold text-white/50 dark:text-charcoal/50 leading-relaxed uppercase">
                                                Add the "Sneaker Care Kit" for $15 to maintain your selection. (AI detected 4 leather pairs)
                                            </p>
                                            <button className="mt-2 text-[9px] font-black text-primary dark:text-charcoal uppercase underline hover:opacity-70 transition-opacity">
                                                Add to cart
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <Footer />
            </main>

            {/* Floating AI Button */}
            <motion.div
                className="fixed bottom-8 right-8 z-[50]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
            >
                <motion.button
                    className="size-16 bg-charcoal dark:bg-primary text-primary dark:text-charcoal rounded-full shadow-2xl flex items-center justify-center border-4 border-primary dark:border-charcoal group relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="material-symbols-outlined text-3xl font-bold">auto_awesome</span>
                    <div className="absolute right-full mr-4 bg-charcoal text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                        Quick Size Check
                    </div>
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default CartPage;
