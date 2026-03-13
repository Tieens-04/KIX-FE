import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StoreSidebar from '../components/StoreSidebar';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, pageTransition, scaleIn } from '../utils/animations';

// Da Nang store locations
const STORES = [
    {
        id: 1,
        name: 'Hải Châu Flagship',
        district: 'Hải Châu',
        address: '123 Đường Nguyễn Văn Linh, Quận Hải Châu',
        hours: '09:00 - 22:00',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
        badge: 'Main Hub',
        featured: false,
        features: ['custom-lab', 'dj-booth', 'cafe'],
    },
    {
        id: 2,
        name: 'Sơn Trà Beach Store',
        district: 'Sơn Trà',
        address: '456 Đường Võ Nguyên Giáp, Quận Sơn Trà',
        hours: '10:00 - 23:00',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20',
        badge: 'Custom Lab',
        featured: true,
        features: ['custom-lab', 'raffle', 'vip'],
    },
    {
        id: 3,
        name: 'Ngũ Hành Sơn Outlet',
        district: 'Ngũ Hành Sơn',
        address: '789 Đường Lê Văn Hiến, Quận Ngũ Hành Sơn',
        hours: '08:00 - 21:00',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9t3YIuCIONp__ieTj-01FjNI4qKViScLPpye53fZMZ8z2gAnpA3WL2ug7H1JeHuUvz1V-zz2oECkFjwU_ztXWpJuezR1wS-8PjdpnmSCqPUqdrrISBqv3WiWgHNNyQqMm_tr-OROEVU5xiQmsP7sJRwlXuVUuWlPbozk5w6JTi9kGZV4A-QrDOou1PwpmBd31giLRbn9DmJdjdnTxtmcwmoh7iKYQMqrZCWAAp87PA9b9tXEdWVntZ6aJdS5qGzxmh1xY_A1HK9w',
        badge: null,
        featured: false,
        features: ['cafe'],
    },
    {
        id: 4,
        name: 'Thanh Khê Street Culture',
        district: 'Thanh Khê',
        address: '321 Đường Điện Biên Phủ, Quận Thanh Khê',
        hours: '09:00 - 22:00',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzL-N7MSKs0QB-0Los94sXBHV0EJohFfa12fdalxqMrgLFY294cmrTOM47D0zXC0GSMq6tRG76LwwrcuJI19Q2AxaDJvb_a38TzvWdibM6ULrXVBl-8L0vOq5bbBVpdKqMh0HNa81tTEtHvj6a5q-SE7SzzfEQvYZvVGJdGmAmqsMJdQQEHWKltpj6J-_V7TX4x0sEsLmvAhqqrb8-KxPNjMRBVJDLE0BBcVJjsY2LZkc9i9pFJ6ZMAfibXTQiys5rOa_Q8bOtps0',
        badge: null,
        featured: false,
        features: ['dj-booth', 'raffle'],
    },
    {
        id: 5,
        name: 'Liên Chiểu Campus Hub',
        district: 'Liên Chiểu',
        address: '555 Đường Tôn Đức Thắng, Quận Liên Chiểu',
        hours: '08:30 - 21:30',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
        badge: 'Student Deals',
        featured: false,
        features: ['cafe'],
    },
    {
        id: 6,
        name: 'Hải Châu Downtown',
        district: 'Hải Châu',
        address: '88 Đường Bạch Đằng, Quận Hải Châu',
        hours: '10:00 - 22:00',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20',
        badge: 'VIP Lounge',
        featured: false,
        features: ['vip', 'raffle', 'custom-lab'],
    },
];

const StoresPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

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

    // Filter stores
    const filteredStores = STORES.filter((store) => {
        if (selectedDistrict !== 'all') {
            const districtMap: { [key: string]: string } = {
                'hai-chau': 'Hải Châu',
                'son-tra': 'Sơn Trà',
                'ngu-hanh-son': 'Ngũ Hành Sơn',
                'thanh-khe': 'Thanh Khê',
                'lien-chieu': 'Liên Chiểu',
            };
            if (store.district !== districtMap[selectedDistrict]) return false;
        }
        if (selectedFeatures.length > 0) {
            if (!selectedFeatures.some(f => store.features.includes(f))) return false;
        }
        return true;
    });

    return (
        <motion.div
            className="min-h-screen bg-background-light dark:bg-background-dark"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
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
                <StoreSidebar
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    selectedFeatures={selectedFeatures}
                    setSelectedFeatures={setSelectedFeatures}
                />

                {/* Main Content */}
                <main className="flex-1 lg:ml-72">
                    {/* Map Section */}
                    <section className="relative w-full h-[50vh] bg-background-alt dark:bg-charcoal overflow-hidden border-b border-border-light dark:border-border-dark">
                        <div className="absolute inset-0 bg-grid opacity-20"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                {/* Abstract Map Background */}
                                <div className="absolute inset-0 opacity-40">
                                    <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0,500 Q250,450 500,500 T1000,500" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                                        <path d="M500,0 Q450,250 500,500 T500,1000" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                                        <circle cx="300" cy="400" fill="#25f425" opacity="0.1" r="100" />
                                        <circle cx="700" cy="600" fill="#25f425" opacity="0.1" r="150" />
                                    </svg>
                                </div>
                                {/* Map Pins */}
                                <div className="absolute top-[30%] left-[25%] animate-bounce">
                                    <div className="size-10 bg-primary rounded-full border-4 border-white dark:border-charcoal shadow-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-charcoal font-black text-xl">location_on</span>
                                    </div>
                                </div>
                                <div className="absolute top-[55%] left-[65%]">
                                    <div className="size-10 bg-primary rounded-full border-4 border-white dark:border-charcoal shadow-xl flex items-center justify-center scale-110">
                                        <span className="material-symbols-outlined text-charcoal font-black text-xl">location_on</span>
                                    </div>
                                </div>
                                <div className="absolute top-[40%] left-[80%]">
                                    <div className="size-8 bg-charcoal dark:bg-primary rounded-full border-4 border-white dark:border-charcoal shadow-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary dark:text-charcoal font-black text-sm">location_on</span>
                                    </div>
                                </div>
                                <div className="absolute top-[60%] left-[40%]">
                                    <div className="size-8 bg-charcoal dark:bg-primary rounded-full border-4 border-white dark:border-charcoal shadow-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary dark:text-charcoal font-black text-sm">location_on</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title Overlay */}
                        <motion.div
                            className="absolute top-10 left-10 z-10"
                            variants={fadeInLeft}
                            initial="initial"
                            animate="animate"
                        >
                            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                                Khám Phá <br />
                                <span className="text-primary bg-charcoal px-4">Đà Nẵng</span>
                            </h1>
                        </motion.div>

                        {/* Nearest Store Card */}
                        <motion.div
                            className="absolute bottom-8 right-8 z-10"
                            variants={fadeInRight}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 0.3 }}
                        >
                            <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-border-light dark:border-border-dark shadow-2xl max-w-xs">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Cửa Hàng Gần Nhất</p>
                                <h3 className="font-black text-xl uppercase mb-1">Hải Châu Flagship</h3>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">123 Đường Nguyễn Văn Linh, Đà Nẵng</p>
                                <motion.button
                                    className="w-full bg-primary text-charcoal py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Chỉ Đường
                                </motion.button>
                            </div>
                        </motion.div>
                    </section>

                    {/* Stores Grid Section */}
                    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Cửa Hàng Tại Đà Nẵng</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Không gian dành cho cộng đồng sneakerhead.</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="size-12 rounded-full border-2 border-charcoal dark:border-white flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                                    <span className="material-symbols-outlined">filter_list</span>
                                </button>
                                <button className="px-6 py-2 bg-charcoal dark:bg-primary text-white dark:text-charcoal rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-charcoal dark:hover:bg-white transition-all">
                                    Xem Tất Cả
                                </button>
                            </div>
                        </div>

                        {/* Stores Grid */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {filteredStores.map((store, index) => (
                                <motion.div
                                    key={store.id}
                                    className={`group ${index % 3 === 1 ? 'xl:mt-12' : ''}`}
                                    variants={staggerItem}
                                    initial={{ opacity: 0, y: 30, rotate: index % 2 === 0 ? 1 : -1 }}
                                    animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 1 : -1 }}
                                    whileHover={{ rotate: 0, y: -10 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    {store.featured ? (
                                        /* Featured Store Card */
                                        <div className="bg-charcoal dark:bg-primary rounded-[2.5rem] p-4 shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-0">
                                            <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 relative">
                                                <img
                                                    alt={store.name}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                    src={store.image}
                                                />
                                                {store.badge && (
                                                    <div className="absolute bottom-4 left-4 flex gap-2">
                                                        <span className="bg-white/20 backdrop-blur-md text-white dark:text-charcoal px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            {store.badge}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-4 pb-4 text-white dark:text-charcoal">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h3 className="text-3xl font-black uppercase italic leading-tight text-primary dark:text-charcoal">{store.name}</h3>
                                                        <p className="text-sm font-bold opacity-50 uppercase tracking-widest">{store.district}, Đà Nẵng</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 mb-8">
                                                    <div className="flex items-center gap-3 text-sm font-medium opacity-70">
                                                        <span className="material-symbols-outlined text-primary dark:text-charcoal text-lg">schedule</span>
                                                        <span>{store.hours}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm font-medium opacity-70">
                                                        <span className="material-symbols-outlined text-primary dark:text-charcoal text-lg">pin_drop</span>
                                                        <span>{store.address}</span>
                                                    </div>
                                                </div>
                                                <button className="w-full py-4 bg-white dark:bg-charcoal text-charcoal dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-primary dark:hover:bg-primary hover:text-charcoal transition-all flex items-center justify-center gap-2">
                                                    Chỉ Đường
                                                    <span className="material-symbols-outlined text-sm">arrow_outward</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Regular Store Card */
                                        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-border-light dark:border-border-dark p-4 shadow-sm hover:shadow-2xl transition-all duration-500 hover:rotate-0">
                                            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative">
                                                <img
                                                    alt={store.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    src={store.image}
                                                />
                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                {store.badge && (
                                                    <div className="absolute top-4 left-4 bg-primary text-charcoal px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        {store.badge}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-4 pb-4">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h3 className="text-2xl font-black uppercase italic leading-tight">{store.name}</h3>
                                                        <p className="text-sm font-bold opacity-40 uppercase tracking-widest">{store.district}, Đà Nẵng</p>
                                                    </div>
                                                    <div className="size-12 bg-background-alt dark:bg-charcoal rounded-2xl flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary">bolt</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 mb-8">
                                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                                                        <span>{store.hours}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        <span className="material-symbols-outlined text-primary text-lg">pin_drop</span>
                                                        <span>{store.address}</span>
                                                    </div>
                                                </div>
                                                <button className="w-full py-4 bg-primary text-charcoal rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-charcoal hover:text-white transition-all flex items-center justify-center gap-2">
                                                    Chỉ Đường
                                                    <span className="material-symbols-outlined text-sm">arrow_outward</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Experience Center Section */}
                        <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-7 bg-primary rounded-[4rem] p-12 relative overflow-hidden group">
                                <div className="absolute -right-20 -bottom-20 size-80 bg-white/20 rounded-full blur-3xl"></div>
                                <div className="relative z-10">
                                    <span className="inline-block px-4 py-1 bg-charcoal text-white text-[10px] font-black uppercase tracking-widest mb-6 rounded-sm">
                                        Trung Tâm Trải Nghiệm
                                    </span>
                                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8 text-charcoal">
                                        KHÔNG CHỈ LÀ <br />CỬA HÀNG.
                                    </h2>
                                    <p className="text-xl font-bold text-charcoal/70 mb-10 max-w-md">
                                        Các cửa hàng của chúng tôi có DJ booth, phòng customization và các đợt raffle giới hạn. Tham gia cùng cộng đồng.
                                    </p>
                                    <div className="flex gap-4 flex-wrap">
                                        <button className="px-8 py-4 bg-charcoal text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                                            Lịch Sự Kiện
                                        </button>
                                        <button className="px-8 py-4 bg-white/30 backdrop-blur-sm text-charcoal border-2 border-charcoal/20 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white transition-all">
                                            VIP Access
                                        </button>
                                    </div>
                                </div>
                                <img
                                    alt="Sneaker Graphic"
                                    className="absolute right-0 bottom-0 w-2/3 object-contain pointer-events-none opacity-20 group-hover:rotate-12 transition-transform duration-1000"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20"
                                />
                            </div>

                            <div className="lg:col-span-5 space-y-8">
                                <div className="bg-background-alt dark:bg-card-dark p-10 rounded-[3rem] border-4 border-primary/20 rotate-1 hover:rotate-0 transition-transform">
                                    <h4 className="font-black text-2xl uppercase mb-4">Hội An Heritage Store</h4>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
                                        Cửa hàng mới nhất của chúng tôi, kết hợp văn hóa phố cổ với streetwear hiện đại.
                                    </p>
                                    <div className="flex -space-x-4">
                                        <div className="size-12 rounded-full border-4 border-white dark:border-charcoal bg-gray-200 dark:bg-charcoal overflow-hidden">
                                            <img
                                                alt="User"
                                                className="w-full h-full object-cover"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzL-N7MSKs0QB-0Los94sXBHV0EJohFfa12fdalxqMrgLFY294cmrTOM47D0zXC0GSMq6tRG76LwwrcuJI19Q2AxaDJvb_a38TzvWdibM6ULrXVBl-8L0vOq5bbBVpdKqMh0HNa81tTEtHvj6a5q-SE7SzzfEQvYZvVGJdGmAmqsMJdQQEHWKltpj6J-_V7TX4x0sEsLmvAhqqrb8-KxPNjMRBVJDLE0BBcVJjsY2LZkc9i9pFJ6ZMAfibXTQiys5rOa_Q8bOtps0"
                                            />
                                        </div>
                                        <div className="size-12 rounded-full border-4 border-white dark:border-charcoal bg-primary flex items-center justify-center font-black text-xs text-charcoal">
                                            +2k
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-charcoal dark:bg-primary text-white dark:text-charcoal p-8 rounded-[2.5rem] -rotate-1 hover:rotate-0 transition-transform">
                                    <p className="text-primary dark:text-charcoal font-black uppercase tracking-widest text-xs mb-2">Sắp Khai Trương</p>
                                    <h4 className="text-2xl font-black uppercase mb-4 italic leading-tight">Bà Nà Hills Experience</h4>
                                    <p className="text-sm font-medium opacity-60 mb-6">
                                        Trải nghiệm mua sắm độc đáo tại độ cao 1.500m với view tuyệt đẹp.
                                    </p>
                                    <button className="text-primary dark:text-charcoal font-black uppercase tracking-widest text-xs underline underline-offset-8">
                                        Đăng Ký Nhận Thông Báo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <Footer />
                </main>
            </div>
        </motion.div>
    );
};

export default StoresPage;
