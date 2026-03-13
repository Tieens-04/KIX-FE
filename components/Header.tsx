import React from 'react';
import { motion } from 'framer-motion';
import { navigateWithTransition } from './PageTransition';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleAISearch: (e?: React.FormEvent) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    isHomePage?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    searchQuery,
    setSearchQuery,
    handleAISearch,
    isDarkMode,
    toggleDarkMode,
    isHomePage = false,
}) => {
    const { user, isAuthenticated, isAdmin, isStoreManager, logout } = useAuth();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    const NAV_ITEMS = [
        { label: 'Sneakers', href: '/sneakers', showIndicator: true },
        { label: 'Studio', href: '/studio', showIndicator: true },
        { label: 'AI', href: '/chat', showIndicator: true },
        { label: 'Stores', href: '/stores', showIndicator: true },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        if (currentPath !== href) navigateWithTransition(href);
    };

    const handleLogout = async () => {
        await logout();
        navigateWithTransition('/login');
    };

    const handleProfileClick = () => {
        if (!isAuthenticated) {
            navigateWithTransition('/login');
        } else if (isAdmin) {
            navigateWithTransition('/admin');
        } else if (isStoreManager) {
            navigateWithTransition('/store-manager');
        } else {
            navigateWithTransition('/profile');
        }
    };

    const wrapperClass = isHomePage
        ? "fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-4"
        : "fixed top-0 left-0 right-0 z-50";

    const headerClass = isHomePage
        ? "flex w-full max-w-6xl items-center justify-between bg-white/90 dark:bg-charcoal/90 backdrop-blur-xl border border-border-light dark:border-border-dark px-6 py-3 rounded-full shadow-lg transition-all"
        : "flex w-full items-center justify-between bg-white dark:bg-charcoal border-b border-border-light dark:border-border-dark px-8 h-16 shadow-sm transition-all";

    return (
        <div className={wrapperClass}>
            <header className={headerClass}>
                <div className="flex items-center gap-8">
                    <a href="/" onClick={(e) => handleNavClick(e, '/')} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`size-8 bg-primary ${isHomePage ? 'rounded-full shadow-[0_0_15px_rgba(37,244,37,0.5)]' : 'rounded-lg shadow-sm'} flex items-center justify-center text-charcoal group-hover:rotate-12 transition-transform`}>
                            <span className="material-symbols-outlined font-bold text-xl">bolt</span>
                        </div>
                        <h2 className={`${isHomePage ? 'text-lg' : 'text-xl'} font-black tracking-tighter uppercase ${isHomePage ? '' : 'italic'}`}>KIX</h2>
                    </a>
                    <nav className="hidden lg:flex items-center gap-6">
                        {NAV_ITEMS.map((item) => {
                            const isActive = currentPath === item.href;
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item.href)}
                                    className={`relative text-sm font-bold hover:text-primary transition-colors py-2 ${item.showIndicator && isActive ? 'text-primary' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    {item.label}
                                    {item.showIndicator && isActive && (
                                        <motion.div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" layoutId="activeNavIndicator" initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                                    )}
                                </a>
                            );
                        })}
                        {/* Role-specific nav items */}
                        {isAuthenticated && (
                            <a
                                href="/orders"
                                onClick={(e) => handleNavClick(e, '/orders')}
                                className={`relative text-sm font-bold hover:text-primary transition-colors py-2 ${currentPath === '/orders' ? 'text-primary' : 'opacity-70 hover:opacity-100'}`}
                            >
                                Orders
                            </a>
                        )}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <form onSubmit={handleAISearch} className="hidden lg:flex items-center bg-gray-100 dark:bg-border-dark rounded-full px-3 py-1.5 border border-transparent focus-within:border-primary focus-within:bg-white dark:focus-within:bg-charcoal transition-all">
                        <span className="material-symbols-outlined text-sm text-primary opacity-80 mr-2">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-xs w-56 xl:w-72 placeholder:text-charcoal/40 dark:placeholder:text-white/40 text-charcoal dark:text-white font-bold"
                            placeholder="Search sneakers, styles..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                    <div className="flex items-center gap-2">
                        {/* Role badge */}
                        {isAuthenticated && !isHomePage && (
                            <div className="hidden xl:flex items-center gap-1 bg-charcoal dark:bg-primary text-white dark:text-charcoal px-3 py-1 rounded-full">
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {isAdmin ? 'Admin' : isStoreManager ? 'Manager' : user?.name || 'User'}
                                </span>
                                <span className="size-1.5 bg-primary dark:bg-charcoal rounded-full animate-pulse"></span>
                            </div>
                        )}
                        {/* Dashboard shortcut for admin/manager */}
                        {(isAdmin || isStoreManager) && (
                            <motion.button
                                onClick={() => navigateWithTransition(isAdmin ? '/admin' : '/store-manager')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="material-symbols-outlined">dashboard</span>
                            </motion.button>
                        )}
                        <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors" aria-label="Toggle dark mode">
                            <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                        <a href="/cart" onClick={(e) => handleNavClick(e, '/cart')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors relative">
                            <span className="material-symbols-outlined">shopping_bag</span>
                        </a>
                        <button onClick={handleProfileClick} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors" aria-label="Profile">
                            <span className="material-symbols-outlined">account_circle</span>
                        </button>
                        {isAuthenticated ? (
                            <motion.button
                                onClick={handleLogout}
                                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors text-red-600 dark:text-red-400"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Logout"
                            >
                                <span className="material-symbols-outlined text-base">logout</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">Logout</span>
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={() => navigateWithTransition('/login')}
                                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors text-charcoal dark:text-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="material-symbols-outlined text-base">login</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">Login</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;
