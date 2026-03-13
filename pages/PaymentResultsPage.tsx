import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import { navigateWithTransition } from '../components/PageTransition';
import { fadeInUp, staggerContainer, staggerItem, pageTransition } from '../utils/animations';

// Purchased items
const PURCHASED_ITEMS = [
    {
        id: 1,
        name: 'VaporMax Flyknit',
        size: '9.0',
        color: 'Volt Green',
        price: 189.00,
        rating: 4,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
    },
    {
        id: 2,
        name: 'Dunk Low Pro',
        size: '9.0',
        color: 'Sky Blue',
        price: 120.00,
        rating: 5,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20',
    },
];

const EXPERIENCE_TAGS = ['Fast Shipping', 'Easy Checkout', 'Great Support', 'Packaging'];

const PaymentResultsPage: React.FC = () => {
    const [reviews, setReviews] = useState<Record<number, { rating: number; comment: string }>>({});
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showConfetti, setShowConfetti] = useState(true);

    const subtotal = PURCHASED_ITEMS.reduce((sum, item) => sum + item.price, 0);
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    const orderNumber = '#SK-829104';
    const deliveryDate = 'Friday, Dec 15';
    const email = 'trantuanhiep.fpt@example.com';

    useEffect(() => {
        // Hide confetti after animation
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleRating = (itemId: number, rating: number) => {
        setReviews(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], rating }
        }));
    };

    const handleComment = (itemId: number, comment: string) => {
        setReviews(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], comment }
        }));
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    return (
        <motion.div
            className="min-h-screen bg-background-light dark:bg-background-dark"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            {/* Confetti Animation */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
                        {[...Array(50)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-3 h-3 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    backgroundColor: ['#25f425', '#111811', '#ffffff'][Math.floor(Math.random() * 3)],
                                }}
                                initial={{ y: -20, opacity: 1 }}
                                animate={{
                                    y: '100vh',
                                    rotate: Math.random() * 720,
                                    opacity: 0,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    delay: Math.random() * 0.5,
                                    ease: 'easeIn',
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-charcoal border-b border-border-light dark:border-border-dark px-8 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }}
                        className="flex items-center gap-3 group"
                    >
                        <div className="size-8 bg-charcoal dark:bg-primary rounded-lg flex items-center justify-center text-primary dark:text-charcoal shadow-sm group-hover:bg-primary group-hover:text-charcoal dark:group-hover:bg-charcoal dark:group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined font-bold text-xl">bolt</span>
                        </div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic">KIX</h2>
                    </a>
                </div>
                <div className="flex items-center gap-6">
                    <a
                        href="/sneakers"
                        onClick={(e) => { e.preventDefault(); navigateWithTransition('/sneakers'); }}
                        className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors italic"
                    >
                        My Orders
                    </a>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-40">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Secure Session
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">
                {/* Success Header */}
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <motion.div
                        className="inline-flex items-center justify-center size-20 bg-primary text-charcoal rounded-full mb-6 shadow-xl shadow-primary/20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                    >
                        <span className="material-symbols-outlined text-4xl font-black">check_circle</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">Payment Successful</h1>
                    <p className="text-charcoal/60 dark:text-white/60 font-bold uppercase tracking-widest text-sm">
                        Thank you for your purchase. Your sneakers are being prepped.
                    </p>
                </motion.div>

                {/* Order Info Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Order Number Card */}
                    <motion.div
                        className="bg-charcoal dark:bg-primary text-white dark:text-charcoal p-8 rounded-[2.5rem] flex flex-col justify-between"
                        variants={staggerItem}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 dark:text-charcoal/60">Order Number</span>
                                <h3 className="text-3xl font-black italic mt-1 uppercase">{orderNumber}</h3>
                            </div>
                            <motion.button
                                className="bg-white/10 dark:bg-charcoal/10 hover:bg-white/20 dark:hover:bg-charcoal/20 p-3 rounded-xl transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigator.clipboard.writeText(orderNumber)}
                            >
                                <span className="material-symbols-outlined text-xl">content_copy</span>
                            </motion.button>
                        </div>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary/20 dark:bg-charcoal/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary dark:text-charcoal">mail</span>
                            </div>
                            <p className="text-xs font-bold text-white/60 dark:text-charcoal/60">
                                Confirmation sent to <span className="text-white dark:text-charcoal">{email}</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Delivery Card */}
                    <motion.div
                        className="bg-primary dark:bg-charcoal text-charcoal dark:text-white p-8 rounded-[2.5rem] flex flex-col justify-between"
                        variants={staggerItem}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/40 dark:text-white/40">Estimated Delivery</span>
                            <h3 className="text-3xl font-black italic mt-1 uppercase">{deliveryDate}</h3>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-charcoal/10 dark:bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined">local_shipping</span>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest">Standard Express</p>
                            </div>
                            <motion.button
                                className="bg-charcoal dark:bg-primary text-white dark:text-charcoal px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-charcoal/80 dark:hover:bg-white transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Track Order
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
                    {/* Review Section */}
                    <motion.section
                        className="space-y-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div
                            className="bg-white dark:bg-card-dark p-8 md:p-10 rounded-[2.5rem] border-2 border-gray-100 dark:border-border-dark shadow-sm"
                            variants={staggerItem}
                        >
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-4">
                                Review Your Purchase
                                <span className="h-[2px] w-12 bg-primary"></span>
                            </h2>

                            <div className="space-y-10">
                                {PURCHASED_ITEMS.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        className={`flex flex-col md:flex-row gap-8 ${index < PURCHASED_ITEMS.length - 1 ? 'pb-10 border-b border-gray-100 dark:border-border-dark' : ''}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="w-32 h-32 bg-background-alt dark:bg-charcoal rounded-2xl flex-shrink-0 p-4">
                                            <img
                                                alt={item.name}
                                                className="w-full h-full object-contain -rotate-12"
                                                src={item.image}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h4 className="text-lg font-black uppercase italic tracking-tight">{item.name}</h4>
                                                <p className="text-[10px] font-bold text-charcoal/40 dark:text-white/40 uppercase tracking-widest">
                                                    Size {item.size} • {item.color}
                                                </p>
                                            </div>

                                            {/* Star Rating */}
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <motion.button
                                                        key={star}
                                                        onClick={() => handleRating(item.id, star)}
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <span
                                                            className={`material-symbols-outlined cursor-pointer transition-colors ${star <= (reviews[item.id]?.rating || item.rating)
                                                                ? 'text-primary'
                                                                : 'text-gray-200 dark:text-gray-600 hover:text-primary'
                                                                }`}
                                                            style={{ fontVariationSettings: star <= (reviews[item.id]?.rating || item.rating) ? "'FILL' 1" : "'FILL' 0" }}
                                                        >
                                                            star
                                                        </span>
                                                    </motion.button>
                                                ))}
                                            </div>

                                            <textarea
                                                className="w-full bg-background-alt dark:bg-charcoal border-none rounded-xl p-4 text-xs font-bold placeholder:text-charcoal/20 dark:placeholder:text-white/20 focus:ring-2 focus:ring-primary"
                                                placeholder="TELL US ABOUT THE FIT..."
                                                rows={2}
                                                value={reviews[item.id]?.comment || ''}
                                                onChange={(e) => handleComment(item.id, e.target.value)}
                                            />
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Experience Tags */}
                                <motion.div
                                    className="bg-charcoal dark:bg-primary p-8 rounded-3xl text-white dark:text-charcoal"
                                    variants={staggerItem}
                                >
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-4 italic">Overall Experience</h4>
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {EXPERIENCE_TAGS.map((tag) => (
                                            <motion.button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedTags.includes(tag)
                                                    ? 'bg-primary dark:bg-charcoal text-charcoal dark:text-primary border-primary dark:border-charcoal'
                                                    : 'border-white/20 dark:border-charcoal/20 hover:bg-primary hover:text-charcoal hover:border-primary dark:hover:bg-charcoal dark:hover:text-primary dark:hover:border-charcoal'
                                                    }`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {tag}
                                            </motion.button>
                                        ))}
                                    </div>
                                    <motion.button
                                        className="w-full py-4 bg-primary dark:bg-charcoal text-charcoal dark:text-primary text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white dark:hover:bg-white hover:text-charcoal transition-all shadow-xl shadow-primary/10"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Submit Reviews
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.section>

                    {/* Purchase Details Sidebar */}
                    <motion.aside
                        className="space-y-6"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-white dark:bg-card-dark border-2 border-gray-100 dark:border-border-dark p-8 rounded-[2.5rem] sticky top-24">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex justify-between items-center">
                                Purchase Details
                                <span className="text-[10px] bg-charcoal dark:bg-primary text-primary dark:text-charcoal px-2 py-0.5 rounded italic">{PURCHASED_ITEMS.length} Items</span>
                            </h3>

                            {/* Price Breakdown */}
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40">
                                    <span>Subtotal</span>
                                    <span className="text-charcoal dark:text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40">
                                    <span>Shipping</span>
                                    <span className="text-primary italic">Free</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40">
                                    <span>Taxes</span>
                                    <span className="text-charcoal dark:text-white">${taxes.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-border-dark flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Paid</span>
                                    <span className="text-3xl font-black italic tracking-tighter text-charcoal dark:text-white">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <motion.button
                                    className="w-full py-4 border-2 border-charcoal dark:border-white text-charcoal dark:text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Download Invoice
                                </motion.button>
                                <motion.button
                                    onClick={() => navigateWithTransition('/sneakers')}
                                    className="w-full py-4 bg-gray-100 dark:bg-charcoal text-charcoal dark:text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 dark:hover:bg-primary dark:hover:text-charcoal transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Return to Shop
                                </motion.button>
                            </div>
                        </div>

                        {/* Share Section */}
                        <div className="bg-background-alt dark:bg-card-dark p-6 rounded-[2rem] border border-gray-100 dark:border-border-dark text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-charcoal/40 dark:text-white/40">Share your latest pick-up</p>
                            <div className="flex justify-center gap-4">
                                <motion.button
                                    className="size-10 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border border-gray-100 dark:border-border-dark hover:text-primary transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="material-symbols-outlined text-lg">share</span>
                                </motion.button>
                                <motion.button
                                    className="size-10 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border border-gray-100 dark:border-border-dark hover:text-primary transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.aside>
                </div>

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
                        Need styling tips?
                    </div>
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default PaymentResultsPage;
