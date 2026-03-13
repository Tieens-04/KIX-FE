import React from 'react';
import { motion } from 'framer-motion';
import { navigateWithTransition } from './PageTransition';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeNav: string;
}

const NAV_ITEMS = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
    { icon: 'inventory_2', label: 'Inventory', path: '/admin/inventory' },
    { icon: 'receipt_long', label: 'Stock Tickets', path: '/admin/stock-tickets' },
    { icon: 'category', label: 'Products', path: '/admin/products' },
    { icon: 'local_shipping', label: 'Orders', path: '/admin/orders' },
    { icon: 'smart_toy', label: 'AI Assistant', path: '/admin/analytics' },
    { icon: 'person', label: 'Customers', path: '/admin/customers' },
    { icon: 'local_offer', label: 'Promotions', path: '/admin/promotions' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeNav }) => {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background-light">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 bg-white border-b lg:border-r border-border-light flex flex-col z-50">
                <div className="p-8 flex items-center gap-3">
                    <motion.div
                        className="size-10 bg-primary rounded-xl flex items-center justify-center text-charcoal"
                        style={{ boxShadow: '6px 6px 0px #111811' }}
                        whileHover={{ rotate: 6, scale: 1.05 }}
                    >
                        <span className="material-symbols-outlined font-black">bolt</span>
                    </motion.div>
                    <h2 className="text-xl font-black tracking-tighter uppercase italic">Admin KIX</h2>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-4">Management</p>

                    {NAV_ITEMS.map((item) => (
                        <motion.a
                            key={item.label}
                            href={item.path}
                            onClick={(e) => { e.preventDefault(); navigateWithTransition(item.path); }}
                            className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold uppercase tracking-tight text-sm transition-all ${activeNav === item.label
                                ? 'bg-primary text-charcoal font-black italic'
                                : 'text-charcoal/60 hover:text-charcoal hover:bg-gray-100'
                                }`}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {item.label}
                        </motion.a>
                    ))}

                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mt-10 mb-4">Settings</p>
                    <motion.a
                        href="/admin/settings"
                        onClick={(e) => { e.preventDefault(); navigateWithTransition('/admin/settings'); }}
                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold uppercase tracking-tight text-sm transition-all ${activeNav === 'Settings'
                            ? 'bg-primary text-charcoal font-black italic'
                            : 'text-charcoal/60 hover:text-charcoal hover:bg-gray-100'
                            }`}
                        whileHover={{ x: 4 }}
                    >
                        <span className="material-symbols-outlined">settings</span>
                        Store Settings
                    </motion.a>
                </nav>

                {/* User Profile */}
                <div className="p-6 border-t border-border-light">
                    <div className="flex items-center gap-3 p-3 bg-background-alt rounded-2xl">
                        <div className="size-10 rounded-full bg-charcoal overflow-hidden border-2 border-primary">
                            <img
                                alt="Admin"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAef88ljUx_fBsfo8BQklz05NqFPWXBWd-heKATxlsqDlDA7AozHZlZB6021RAfeHwQ7y94gTjVBAC7DtAHp5imEttxwxoUgbOHSw9x9qeRcqFflk6vkjt1FI9vmo4Wb-PcQbwIGWBwfMM3tjcv56dfBHc-94YeDzXAQuYgRzhL_c6F3jdVn38U6EaMd_fqjWo9_WBdAwOgdp1P1q2QQkwifq1X60QiaZnnEe541WddHOfs1u1cURQ3_m7AxjQ1UI1v81qZjm9WvAA"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight">Tran Tuan Hiep</p>
                            <p className="text-[10px] opacity-50 uppercase font-bold">Senior Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                <div className="flex-1 p-6 lg:p-10 bg-background-alt overflow-y-auto relative">
                    {/* Grid Background */}
                    <div
                        className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#25f425 1.5px, transparent 1.5px)',
                            backgroundSize: '30px 30px'
                        }}
                    ></div>
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white border-t-8 border-primary py-8 px-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-charcoal shadow-md">
                                <span className="material-symbols-outlined text-xl font-black">bolt</span>
                            </div>
                            <h2 className="text-lg font-black tracking-tighter uppercase italic">Admin KIX</h2>
                        </div>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">© 2024 KIX Lab. Internal System.</p>
                    </div>
                    <div className="relative z-10 flex gap-10 text-[10px] font-black uppercase tracking-widest">
                        <a className="hover:text-primary transition-colors" href="#">Support</a>
                        <a className="hover:text-primary transition-colors" href="#">Security</a>
                        <a className="hover:text-primary transition-colors" href="#">Logs</a>
                        <motion.button
                            onClick={() => navigateWithTransition('/login')}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            Logout
                        </motion.button>
                        <div className="flex items-center gap-2 ml-4">
                            <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="opacity-50">System Status: Optimal</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;
