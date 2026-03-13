import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, SearchResult } from '../types';
import { PRODUCTS, SIZES } from '../constants';
import Button from '../components/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AISearchModal from '../components/AISearchModal';
import { searchSneakers } from '../services/geminiService';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn, pageTransition } from '../utils/animations';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../context/AuthContext';

const Homepage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAISearchLoading, setIsAISearchLoading] = useState(false);
    const [aiSearchResult, setAiSearchResult] = useState<SearchResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
    const [selectedSize, setSelectedSize] = useState('8.5');
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleAISearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;

        setIsAISearchLoading(true);
        setIsModalOpen(true);

        const result = await searchSneakers(searchQuery);
        setAiSearchResult(result);
        setIsAISearchLoading(false);
    };

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const { isAuthenticated } = useAuth();

    const handleAddToCart = async (product: Product) => {
        if (!isAuthenticated) {
            showToast('Vui lòng đăng nhập để thêm vào giỏ!');
            return;
        }
        try {
            await cartApi.addItem({ product_id: (product as any)._id || (product as any).id, quantity: 1 });
            showToast(`'${product.name}' added to your box!`);
        } catch (err: any) {
            showToast(err?.message || 'Không thể thêm vào giỏ');
        }
    };

    return (
        <motion.div
            className="min-h-screen"
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
                isHomePage={true}
            />

            <main className="pt-32 pb-20 px-4 md:px-10 lg:px-20 max-w-[1440px] mx-auto">
                {/* Intro Section */}
                <motion.div
                    className="mb-16 relative"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <div className="absolute -top-10 -left-10 size-40 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="flex flex-wrap justify-between items-end gap-6 relative z-10">
                        <motion.div className="max-w-2xl" variants={fadeInLeft}>
                            <motion.p
                                className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-4"
                                variants={staggerItem}
                            >
                                Sneaker E-comm UI Kit v2
                            </motion.p>
                            <motion.h1
                                className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6 uppercase"
                                variants={staggerItem}
                            >
                                Vibrant <br />
                                <span className="text-primary">System</span>
                            </motion.h1>
                            <motion.p
                                className="text-xl font-medium opacity-70"
                                variants={staggerItem}
                            >
                                Premium streetwear components with integrated AI search patterns and next-gen {isDarkMode ? 'dark' : 'light'}-themed modules.
                            </motion.p>
                        </motion.div>
                        <motion.div className="flex gap-3" variants={fadeInRight}>
                            <motion.span
                                className="px-6 py-3 bg-white dark:bg-card-dark border-4 border-primary rounded-xl text-sm font-black text-charcoal dark:text-white shadow-[6px_6px_0px_#111811] dark:shadow-[6px_6px_0px_#25f425]"
                                whileHover={{ scale: 1.05, rotate: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                v2.0.1
                            </motion.span>
                            <motion.span
                                className="px-6 py-3 bg-primary rounded-xl text-sm font-black text-charcoal shadow-[6px_6px_0px_#111811]"
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                STABLE
                            </motion.span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Hero Section */}
                <section className="mb-32" id="hero-preview">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Component: Premium Hero</h2>
                        <div className="h-1 flex-1 bg-primary/20"></div>
                        <div className="size-3 bg-primary rounded-full"></div>
                    </div>

                    <div className="hero-gradient rounded-2xl md:rounded-[3rem] overflow-hidden border border-gray-200 dark:border-border-dark relative min-h-[500px] md:min-h-[600px] lg:min-h-[650px] flex items-center shadow-2xl">
                        <div className="absolute inset-0 opacity-[0.03] bg-grid"></div>

                        {/* Content Container with proper constraints */}
                        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-12 md:py-16">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                {/* Text Content */}
                                <div className="max-w-xl order-2 lg:order-1">
                                    <span className="inline-block px-3 md:px-4 py-1 bg-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] mb-4 md:mb-6 rounded-sm skew-x-[-10deg]">Limited Edition Drop</span>
                                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black italic tracking-tighter leading-[0.85] mb-6 md:mb-8 text-charcoal dark:text-white">UNLEASH<br />THE ICON.</h1>
                                    <p className="text-base md:text-lg lg:text-xl font-medium text-gray-600 dark:text-gray-400 mb-8 md:mb-12 max-w-md border-l-4 border-primary pl-4 md:pl-6">Experience the pinnacle of street performance. Engineered for the culture, worn by legends.</p>
                                    <div className="flex flex-wrap gap-3 md:gap-6">
                                        <Button variant="charcoal" size="lg" className="px-6 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 text-xs md:text-sm hover:scale-105">Shop Collection</Button>
                                        <Button variant="outline" size="lg" className="border-2 border-charcoal dark:border-white text-charcoal dark:text-white px-6 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 text-xs md:text-sm hover:bg-charcoal dark:hover:bg-white hover:text-white dark:hover:text-charcoal">Explore</Button>
                                    </div>
                                </div>

                                {/* Image Container with proper constraints */}
                                <div className="relative flex justify-center items-center order-1 lg:order-2">
                                    <div className="absolute w-full h-full bg-red-600/5 blur-[80px] md:blur-[120px] rounded-full"></div>
                                    <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[450px] xl:max-w-[500px]">
                                        <img
                                            alt="Premium Red Sneaker"
                                            className="relative z-10 w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.15)] md:drop-shadow-[0_60px_60px_rgba(0,0,0,0.2)] animate-float hover:rotate-0 transition-transform duration-700 ease-out cursor-pointer"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pagination indicator */}
                        <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 flex items-center gap-4 md:gap-6 text-[10px] md:text-[12px] font-black uppercase tracking-widest text-charcoal dark:text-white">
                            <span className="text-primary">01 / 05</span>
                            <div className="flex gap-1.5 md:gap-2 items-center">
                                <div className="h-1 md:h-1.5 w-8 md:w-12 bg-charcoal dark:bg-white rounded-full"></div>
                                <div className="h-1 md:h-1.5 w-4 md:w-6 bg-charcoal/10 dark:bg-white/20 rounded-full"></div>
                                <div className="h-1 md:h-1.5 w-4 md:w-6 bg-charcoal/10 dark:bg-white/20 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 1: Design Tokens */}
                <section className="mb-32" id="tokens">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-3xl font-black tracking-tight uppercase">Section 1: Design Tokens</h2>
                        <div className="h-1 flex-1 bg-primary/20"></div>
                        <div className="size-3 bg-primary rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 bg-background-alt dark:bg-card-dark p-10 rounded-[2.5rem] border border-border-light dark:border-border-dark relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full"></div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] mb-10 text-primary">Color Palette</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="group cursor-pointer">
                                    <div className="h-32 w-full bg-primary rounded-2xl mb-4 border-4 border-white dark:border-charcoal shadow-lg group-hover:scale-105 transition-all"></div>
                                    <p className="text-sm font-black uppercase">Neon Green</p>
                                    <p className="text-[11px] font-mono opacity-50">#25F425</p>
                                </div>
                                <div className="group cursor-pointer">
                                    <div className="h-32 w-full bg-charcoal rounded-2xl mb-4 border-4 border-white dark:border-primary/30 shadow-lg group-hover:scale-105 transition-all"></div>
                                    <p className="text-sm font-black uppercase">Charcoal</p>
                                    <p className="text-[11px] font-mono opacity-50">#111811</p>
                                </div>
                                <div className="group cursor-pointer mt-4">
                                    <div className="h-32 w-full bg-white dark:bg-background-dark rounded-2xl mb-4 border-4 border-gray-100 dark:border-border-dark shadow-lg group-hover:scale-105 transition-all"></div>
                                    <p className="text-sm font-black uppercase">Background</p>
                                    <p className="text-[11px] font-mono opacity-50">{isDarkMode ? '#102210' : '#FFFFFF'}</p>
                                </div>
                                <div className="group cursor-pointer mt-4">
                                    <div className="h-32 w-full bg-background-alt dark:bg-card-dark rounded-2xl mb-4 border-4 border-white dark:border-charcoal shadow-lg group-hover:scale-105 transition-all"></div>
                                    <p className="text-sm font-black uppercase">Soft Slate</p>
                                    <p className="text-[11px] font-mono opacity-50">{isDarkMode ? '#1b271b' : '#F0F4F0'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-8 bg-charcoal text-white rounded-[2.5rem] shadow-xl transform lg:rotate-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-primary">Typography (Inter)</p>
                                <div className="space-y-8">
                                    <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                                        <span className="text-5xl font-black">Aa</span>
                                        <div className="text-right">
                                            <p className="text-sm font-black">Inter Black</p>
                                            <p className="text-[10px] opacity-50 uppercase tracking-widest">Display</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-3xl font-bold">Aa</span>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">Inter Bold</p>
                                            <p className="text-[10px] opacity-50 uppercase tracking-widest">Interface</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-primary rounded-2xl flex items-center justify-center font-black italic uppercase tracking-tighter text-xl text-charcoal transform lg:-rotate-1">
                                Bold & Vibrant
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Buttons & Inputs */}
                <section className="mb-32" id="buttons">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-3xl font-black tracking-tight uppercase">Section 2: Buttons & Inputs</h2>
                        <div className="h-1 flex-1 bg-primary/20"></div>
                        <div className="size-3 bg-primary rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="bg-white dark:bg-card-dark p-10 rounded-[3rem] border-4 border-charcoal dark:border-primary shadow-[12px_12px_0px_#25f425] dark:shadow-[12px_12px_0px_#111811]">
                            <p className="text-xs font-black uppercase tracking-widest mb-10 opacity-40">Interactive Elements</p>
                            <div className="flex flex-wrap gap-6 items-center">
                                <button className="bg-primary text-charcoal px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-110 active:scale-95 transition-all shadow-[0_8px_20px_rgba(37,244,37,0.4)]">Primary</button>
                                <button className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-charcoal transition-all">Secondary</button>
                                <button className="border-2 border-charcoal dark:border-white px-8 py-3.5 rounded-full font-black uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-all">Outlined</button>
                            </div>
                        </div>

                        <div className="relative group p-10">
                            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-2xl"></div>
                            <div className="relative">
                                <p className="text-xs font-black uppercase tracking-widest mb-6 opacity-40">AI Search Experience</p>
                                <div className="relative flex items-center bg-white dark:bg-card-dark border-2 border-charcoal dark:border-border-dark rounded-full px-8 py-5 shadow-xl focus-within:ring-4 focus-within:ring-primary/30 transition-all">
                                    <span className="material-symbols-outlined text-primary text-3xl mr-4">auto_awesome</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 text-lg font-bold placeholder:text-charcoal/20 dark:placeholder:text-white/30 outline-none"
                                        placeholder="Ask AI to find Jordan..."
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                                    />
                                    <button
                                        onClick={() => handleAISearch()}
                                        className="bg-charcoal dark:bg-primary text-white dark:text-charcoal p-3 rounded-full hover:bg-primary hover:text-charcoal dark:hover:bg-white transition-colors ml-2"
                                    >
                                        <span className="material-symbols-outlined text-xl">search</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Product Components */}
                <section className="mb-32" id="cards">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-3xl font-black tracking-tight uppercase">Section 3: Product Components</h2>
                        <div className="h-1 flex-1 bg-primary/20"></div>
                        <div className="size-3 bg-primary rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 items-end">
                        {/* Standard Card */}
                        <div className="md:col-span-2 lg:col-span-4 group bg-white dark:bg-card-dark rounded-3xl overflow-hidden border border-border-light dark:border-border-dark p-3 shadow-sm hover:shadow-2xl transition-all duration-500">
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-background-alt dark:bg-charcoal relative mb-6">
                                <img
                                    alt="Sneaker"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo"
                                />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1 bg-charcoal text-white text-[10px] font-black uppercase tracking-widest rounded-full">New Arrival</span>
                                </div>
                                <button className="absolute top-4 right-4 size-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-xl hover:text-red-500 transition-colors">favorite</span>
                                </button>
                            </div>
                            <div className="px-4 pb-4">
                                <h3 className="font-black text-2xl mb-1 leading-tight uppercase italic">VaporMax Flyknit</h3>
                                <p className="text-xs font-bold opacity-40 mb-6 uppercase tracking-widest">Streetwear • Red/Black</p>
                                <div className="flex justify-between items-center">
                                    <p className="font-black text-3xl">$189</p>
                                    <button
                                        onClick={() => handleAddToCart(PRODUCTS[0])}
                                        className="bg-primary p-3 rounded-2xl text-charcoal shadow-lg hover:bg-charcoal hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined font-black">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Featured Card */}
                        <div className="md:col-span-2 lg:col-span-5 group bg-primary rounded-[3rem] overflow-hidden p-4 transition-all duration-500 hover:-translate-y-4 shadow-xl">
                            <div className="aspect-video rounded-[2rem] overflow-hidden bg-white/40 backdrop-blur-sm relative mb-6 border border-white/20">
                                <img
                                    alt="Sneaker"
                                    className="w-full h-full object-contain p-8 group-hover:scale-125 transition-transform duration-700 rotate-[-15deg]"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20"
                                />
                                <div className="absolute inset-0 bg-charcoal/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-white text-charcoal font-black py-3 px-8 rounded-full text-xs uppercase tracking-widest shadow-xl">Quick View</button>
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-2xl text-charcoal uppercase italic">Dunk Low Pro</h3>
                                        <p className="text-xs font-black opacity-60 uppercase tracking-widest text-charcoal">Skateboarding • Sky Blue</p>
                                    </div>
                                    <span className="material-symbols-outlined text-charcoal text-4xl">verified</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="font-black text-charcoal text-4xl">$120</p>
                                    <div className="flex -space-x-3">
                                        <div className="size-8 rounded-full border-2 border-primary bg-charcoal"></div>
                                        <div className="size-8 rounded-full border-2 border-primary bg-white"></div>
                                        <div className="size-8 rounded-full border-2 border-primary bg-red-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Cards */}
                        <div className="lg:col-span-3 grid grid-cols-1 gap-6 h-full">
                            <div className="group bg-white dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark p-3 hover:border-primary transition-all">
                                <div className="aspect-square rounded-2xl overflow-hidden bg-background-alt dark:bg-charcoal relative mb-4">
                                    <img alt="Sneaker" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9t3YIuCIONp__ieTj-01FjNI4qKViScLPpye53fZMZ8z2gAnpA3WL2ug7H1JeHuUvz1V-zz2oECkFjwU_ztXWpJuezR1wS-8PjdpnmSCqPUqdrrISBqv3WiWgHNNyQqMm_tr-OROEVU5xiQmsP7sJRwlXuVUuWlPbozk5w6JTi9kGZV4A-QrDOou1PwpmBd31giLRbn9DmJdjdnTxtmcwmoh7iKYQMqrZCWAAp87PA9b9tXEdWVntZ6aJdS5qGzxmh1xY_A1HK9w" />
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-sm uppercase italic">Sale -20%</div>
                                </div>
                                <div className="px-2">
                                    <h3 className="font-black text-sm uppercase">Air Max 270</h3>
                                    <p className="font-black text-primary text-lg">$144</p>
                                </div>
                            </div>
                            <div className="group bg-background-alt dark:bg-card-dark rounded-3xl border border-transparent p-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-charcoal relative mb-4">
                                    <img alt="Sneaker" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzL-N7MSKs0QB-0Los94sXBHV0EJohFfa12fdalxqMrgLFY294cmrTOM47D0zXC0GSMq6tRG76LwwrcuJI19Q2AxaDJvb_a38TzvWdibM6ULrXVBl-8L0vOq5bbBVpdKqMh0HNa81tTEtHvj6a5q-SE7SzzfEQvYZvVGJdGmAmqsMJdQQEHWKltpj6J-_V7TX4x0sEsLmvAhqqrb8-KxPNjMRBVJDLE0BBcVJjsY2LZkc9i9pFJ6ZMAfibXTQiys5rOa_Q8bOtps0" />
                                    <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center">
                                        <p className="font-black text-white text-[10px] uppercase tracking-widest border-2 border-white px-4 py-2 rounded-full">Sold Out</p>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <h3 className="font-black text-sm uppercase opacity-40 line-through">Jordan Retro 1</h3>
                                    <p className="font-black text-charcoal/30 dark:text-white/30 text-lg">$299</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Navigation & Overlays */}
                <section className="mb-24">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-3xl font-black tracking-tight uppercase">Section 4: Navigation & Overlays</h2>
                        <div className="h-1 flex-1 bg-primary/20"></div>
                        <div className="size-3 bg-primary rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Category Filter */}
                        <div className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-8 rounded-[2rem]">
                            <p className="text-xs font-black uppercase tracking-widest text-primary mb-6">Category Filter</p>
                            <div className="space-y-2">
                                {['ALL SNEAKERS', 'BASKETBALL', 'RUNNING', 'SKATEBOARDING', 'LIFESTYLE'].map((cat, i) => (
                                    <div key={cat} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${i === 0 ? 'bg-primary/10 border border-primary/30 text-primary' : 'hover:bg-gray-100 dark:hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                        <span className="text-xs font-bold">{cat}</span>
                                        {i === 0 && <span className="material-symbols-outlined text-sm">check</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size Selector */}
                        <div className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-8 rounded-[2rem]">
                            <p className="text-xs font-black uppercase tracking-widest text-primary mb-6">Select Size (US)</p>
                            <div className="grid grid-cols-4 gap-3">
                                {SIZES.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`aspect-square rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedSize === size ? 'bg-primary border-primary text-charcoal' : 'border-border-light dark:border-border-dark hover:border-primary/50'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cart State */}
                        <div className="flex items-center justify-center p-8 bg-background-alt dark:bg-charcoal/50 rounded-[2rem] border border-border-light dark:border-border-dark border-dashed">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                                        <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 size-6 bg-red-600 rounded-full border-2 border-white dark:border-charcoal flex items-center justify-center text-[10px] font-black text-white">1</div>
                                </div>
                                <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">Cart State Prototype</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />

            {/* AI Search Modal Overlay */}
            <AISearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                result={aiSearchResult}
                isLoading={isAISearchLoading}
            />
        </motion.div>
    );
};

export default Homepage;
