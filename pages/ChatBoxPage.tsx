import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, pageTransition } from '../utils/animations';

// Fake chat data
const INITIAL_MESSAGES = [
    {
        id: 1,
        type: 'ai',
        content: {
            title: "What's your vibe today?",
            message: "Tell me where you're headed or what style speaks to you. I'll curate the perfect pair for your rotation.",
            suggestions: ['⚡ Sporty Performance', '🏛️ Classic Minimalist', '🔥 Hype & Edgy', '🌿 Sustainable Street'],
        },
    },
    {
        id: 2,
        type: 'user',
        content: {
            message: "I'm looking for something Sporty but with a pop of color for daily wear.",
        },
    },
    {
        id: 3,
        type: 'ai',
        content: {
            message: "Solid choice. Sporty daily drivers are my specialty. Here are three pairs that fit that 'pop of color' energy perfectly. Which one catches your eye?",
            products: [
                {
                    id: 1,
                    name: 'VaporMax Flyknit',
                    color: 'Volt Green',
                    price: 189,
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
                    badge: 'AI Recommended',
                },
                {
                    id: 2,
                    name: 'Dunk Low Pro',
                    color: 'Sky Blue',
                    price: 120,
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20',
                    badge: 'Best Vibe',
                    featured: true,
                },
                {
                    id: 3,
                    name: 'Air Max 270',
                    color: 'Triple White',
                    price: 144,
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9t3YIuCIONp__ieTj-01FjNI4qKViScLPpye53fZMZ8z2gAnpA3WL2ug7H1JeHuUvz1V-zz2oECkFjwU_ztXWpJuezR1wS-8PjdpnmSCqPUqdrrISBqv3WiWgHNNyQqMm_tr-OROEVU5xiQmsP7sJRwlXuVUuWlPbozk5w6JTi9kGZV4A-QrDOou1PwpmBd31giLRbn9DmJdjdnTxtmcwmoh7iKYQMqrZCWAAp87PA9b9tXEdWVntZ6aJdS5qGzxmh1xY_A1HK9w',
                    badge: 'Flash Sale',
                    badgeColor: 'bg-red-600',
                },
            ],
        },
    },
];

const STYLE_GOALS = [
    { id: 1, name: 'Daily Comfort', active: true },
    { id: 2, name: 'Street Performance', active: false },
    { id: 3, name: 'Collector Edition', active: false },
];

const SAVED_FITS = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20',
];

const ChatBoxPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [messages] = useState(INITIAL_MESSAGES);
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

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

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleAISearch = (e?: React.FormEvent) => {
        e?.preventDefault();
    };

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleAddToCart = (productName: string) => {
        showToast(`'${productName}' added to your box!`);
    };

    return (
        <motion.div
            className="bg-background-light dark:bg-background-dark h-screen flex flex-col overflow-hidden"
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

            <div className="flex flex-1 overflow-hidden pt-16">
                {/* Sidebar */}
                <aside className="w-80 bg-white dark:bg-card-dark border-r border-border-light dark:border-border-dark overflow-y-auto hidden lg:flex flex-col p-8 shrink-0">
                    <div className="space-y-10">
                        {/* Active Stylist */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-charcoal/40 dark:text-white/40">Active Stylist</h4>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-charcoal rounded-2xl border-2 border-primary/20">
                                <div className="size-12 bg-charcoal dark:bg-primary rounded-xl flex items-center justify-center text-primary dark:text-charcoal relative">
                                    <span className="material-symbols-outlined text-2xl">neurology</span>
                                    <div className="absolute -top-1 -right-1 size-3 bg-primary dark:bg-charcoal rounded-full border-2 border-white dark:border-primary"></div>
                                </div>
                                <div>
                                    <p className="font-black text-xs uppercase tracking-widest italic">Kit-01 AI</p>
                                    <p className="text-[10px] font-bold text-charcoal/40 dark:text-white/40">Personal Stylist</p>
                                </div>
                            </div>
                        </div>

                        {/* Style Goals */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-charcoal/40 dark:text-white/40">Style Goals</h4>
                            <div className="space-y-3">
                                {STYLE_GOALS.map((goal) => (
                                    <div
                                        key={goal.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl ${goal.active
                                            ? 'bg-primary/10 border border-primary/30'
                                            : 'bg-gray-50 dark:bg-charcoal border border-transparent'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-sm ${goal.active ? '' : 'opacity-20'}`}>
                                            {goal.active ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${goal.active ? '' : 'opacity-40'}`}>
                                            {goal.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Saved Fits */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-charcoal/40 dark:text-white/40">Saved Fits</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {SAVED_FITS.map((fit, index) => (
                                    <div key={index} className="aspect-square bg-gray-100 dark:bg-charcoal rounded-xl overflow-hidden">
                                        <img alt="Saved" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all cursor-pointer" src={fit} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* New Session Button */}
                    <div className="mt-auto">
                        <button className="w-full py-4 border-2 border-charcoal dark:border-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            New Session
                        </button>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col bg-gradient-to-br from-green-50/50 to-white dark:from-charcoal/50 dark:to-background-dark relative">
                    {/* Messages */}
                    <motion.div
                        className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {messages.map((msg, index) => (
                            <motion.div
                                key={msg.id}
                                variants={staggerItem}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                            >
                                {msg.type === 'ai' ? (
                                    <div className="flex flex-col items-start gap-4">
                                        <div className="size-8 bg-charcoal dark:bg-primary rounded-lg flex items-center justify-center text-primary dark:text-charcoal shrink-0">
                                            <span className="material-symbols-outlined text-sm">neurology</span>
                                        </div>
                                        {msg.content.title ? (
                                            <div className="max-w-2xl bg-white dark:bg-card-dark p-8 rounded-[2rem] rounded-tl-none border border-border-light dark:border-border-dark shadow-xl">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">AI Stylist Assistant</p>
                                                <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">{msg.content.title}</h3>
                                                <p className="text-sm font-bold text-charcoal/60 dark:text-white/60 leading-relaxed mb-8">{msg.content.message}</p>
                                                {msg.content.suggestions && (
                                                    <div className="flex flex-wrap gap-3">
                                                        {msg.content.suggestions.map((sug, i) => (
                                                            <button
                                                                key={i}
                                                                className={`px-6 py-3 text-[10px] font-black rounded-full uppercase tracking-widest transition-all ${i === 0
                                                                    ? 'bg-primary text-charcoal hover:bg-charcoal hover:text-white shadow-lg shadow-primary/20'
                                                                    : 'bg-gray-100 dark:bg-charcoal text-charcoal dark:text-white hover:bg-primary hover:text-charcoal'
                                                                    }`}
                                                            >
                                                                {sug}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-4xl space-y-6">
                                                <div className="bg-white dark:bg-card-dark p-8 rounded-[2rem] rounded-tl-none border border-border-light dark:border-border-dark shadow-xl">
                                                    <p className="text-sm font-bold text-charcoal/60 dark:text-white/60 leading-relaxed">{msg.content.message}</p>
                                                </div>
                                                {msg.content.products && (
                                                    <div className="flex gap-6 overflow-x-auto pb-6 px-2 -mx-2">
                                                        {msg.content.products.map((product) => (
                                                            <div
                                                                key={product.id}
                                                                className={`min-w-[320px] shrink-0 ${product.featured
                                                                    ? 'bg-primary rounded-[2.5rem] p-6 shadow-xl shadow-primary/20 transform hover:-rotate-1 transition-transform'
                                                                    : 'bg-white dark:bg-card-dark rounded-[2.5rem] border-2 border-gray-100 dark:border-border-dark p-4 shadow-lg hover:border-primary transition-all'
                                                                    } group`}
                                                            >
                                                                <div className={`${product.featured ? 'aspect-square rounded-[2rem] bg-white border-4 border-white shadow-inner flex items-center justify-center' : 'aspect-[4/5] rounded-[2rem] overflow-hidden bg-background-alt dark:bg-charcoal'} relative mb-6`}>
                                                                    <img
                                                                        alt={product.name}
                                                                        className={`${product.featured ? 'w-3/4 h-3/4 object-contain rotate-[-15deg]' : 'w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'}`}
                                                                        src={product.image}
                                                                    />
                                                                    <div className={`absolute ${product.featured ? 'top-4 right-4' : 'top-4 left-4'}`}>
                                                                        <span className={`px-3 py-1 ${product.badgeColor || 'bg-charcoal'} text-white text-[8px] font-black uppercase tracking-widest rounded-full`}>
                                                                            {product.badge}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="px-2">
                                                                    <h3 className={`font-black text-xl mb-1 uppercase italic tracking-tighter ${product.featured ? 'text-charcoal' : ''}`}>{product.name}</h3>
                                                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${product.featured ? 'text-charcoal/60' : 'opacity-40'}`}>{product.color} • ${product.price}</p>
                                                                    <button
                                                                        onClick={() => handleAddToCart(product.name)}
                                                                        className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 ${product.featured
                                                                            ? 'bg-charcoal text-white hover:bg-white hover:text-charcoal'
                                                                            : 'bg-primary text-charcoal hover:bg-charcoal hover:text-white'
                                                                            }`}
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">{product.featured ? 'bolt' : 'add_shopping_cart'}</span>
                                                                        {product.featured ? 'Quick Buy' : 'Add to Cart'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end gap-4">
                                        <div className="max-w-md bg-charcoal dark:bg-primary p-6 rounded-[2rem] rounded-tr-none text-white dark:text-charcoal shadow-xl">
                                            <p className="text-sm font-bold italic">"{msg.content.message}"</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Input Area */}
                    <div className="p-6 md:p-10 bg-white/80 dark:bg-charcoal/80 backdrop-blur-md border-t border-border-light dark:border-border-dark shrink-0">
                        <div className="max-w-4xl mx-auto flex items-center gap-4 bg-white dark:bg-card-dark p-2 rounded-2xl shadow-2xl border border-gray-100 dark:border-border-dark">
                            <button className="p-4 hover:bg-gray-100 dark:hover:bg-charcoal rounded-xl transition-colors text-charcoal/40 dark:text-white/40">
                                <span className="material-symbols-outlined">image</span>
                            </button>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-charcoal/20 dark:placeholder:text-white/20"
                                placeholder="Type your style preference..."
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                            />
                            <button className="bg-charcoal dark:bg-primary text-white dark:text-charcoal h-14 px-8 rounded-xl flex items-center justify-center gap-3 hover:bg-primary hover:text-charcoal dark:hover:bg-white transition-all group">
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Send</span>
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">send</span>
                            </button>
                        </div>
                        <div className="max-w-4xl mx-auto mt-4 flex items-center justify-center gap-4">
                            <p className="text-[8px] font-black uppercase tracking-widest text-charcoal/30 dark:text-white/30">AI might suggest based on your browsing history • Vietnamese & English supported</p>
                        </div>
                    </div>
                </main>
            </div>
        </motion.div>
    );
};

export default ChatBoxPage;
