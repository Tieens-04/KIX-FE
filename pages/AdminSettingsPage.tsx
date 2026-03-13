import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';

const AdminSettingsPage: React.FC = () => {
    const [storeName, setStoreName] = useState('KIX Store');
    const [storeEmail, setStoreEmail] = useState('admin@kixstore.com');
    const [currency, setCurrency] = useState('USD');
    const [timezone, setTimezone] = useState('UTC-5');
    const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });
    const [autoRestock, setAutoRestock] = useState(true);
    const [lowStockThreshold, setLowStockThreshold] = useState('10');

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <AdminLayout activeNav="Settings">
                <header className="flex flex-wrap justify-between items-center gap-6 mb-12">
                    <div>
                        <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">System Configuration</p>
                        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">Store <span className="text-primary">Settings</span></h1>
                    </div>
                    <motion.button className="bg-charcoal text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-charcoal transition-all shadow-xl flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <span className="material-symbols-outlined text-lg">save</span>Save Changes
                    </motion.button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                    {/* General Settings */}
                    <motion.section className="lg:col-span-2 space-y-8" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="bg-white p-8 rounded-[2rem] border border-border-light">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">store</span>
                                <h2 className="text-xl font-black uppercase italic">General Information</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Store Name</label>
                                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-4 py-3 bg-background-alt border-none rounded-xl font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Contact Email</label>
                                    <input type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} className="w-full px-4 py-3 bg-background-alt border-none rounded-xl font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Currency</label>
                                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 bg-background-alt border-none rounded-xl font-bold">
                                            <option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Timezone</label>
                                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-3 bg-background-alt border-none rounded-xl font-bold">
                                            <option>UTC-5</option><option>UTC-8</option><option>UTC+0</option><option>UTC+9</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-border-light">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">notifications</span>
                                <h2 className="text-xl font-black uppercase italic">Notifications</h2>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { key: 'email', label: 'Email Notifications', desc: 'Receive order and system updates via email' },
                                    { key: 'sms', label: 'SMS Alerts', desc: 'Get critical alerts via text message' },
                                    { key: 'push', label: 'Push Notifications', desc: 'Browser notifications for real-time updates' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-background-alt rounded-xl">
                                        <div>
                                            <p className="font-black uppercase text-sm">{item.label}</p>
                                            <p className="text-xs opacity-50 mt-1">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-block w-12 h-6">
                                            <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]} onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })} className="sr-only peer" />
                                            <span className="absolute cursor-pointer inset-0 bg-gray-200 rounded-full peer-checked:bg-primary transition-all"></span>
                                            <span className="absolute left-1 top-1 size-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-border-light">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">inventory</span>
                                <h2 className="text-xl font-black uppercase italic">Inventory Management</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-background-alt rounded-xl">
                                    <div>
                                        <p className="font-black uppercase text-sm">Auto Restock Alerts</p>
                                        <p className="text-xs opacity-50 mt-1">Automatically notify when products need restocking</p>
                                    </div>
                                    <label className="relative inline-block w-12 h-6">
                                        <input type="checkbox" checked={autoRestock} onChange={(e) => setAutoRestock(e.target.checked)} className="sr-only peer" />
                                        <span className="absolute cursor-pointer inset-0 bg-gray-200 rounded-full peer-checked:bg-primary transition-all"></span>
                                        <span className="absolute left-1 top-1 size-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Low Stock Threshold</label>
                                    <input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className="w-full px-4 py-3 bg-background-alt border-none rounded-xl font-bold" />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Quick Actions */}
                    <motion.aside className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div className="bg-charcoal text-white p-6 rounded-[2rem]">
                            <h3 className="text-lg font-black uppercase italic mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                {['Backup Database', 'Clear Cache', 'Export Data', 'View Logs'].map((action) => (
                                    <motion.button key={action} className="w-full bg-white/10 hover:bg-primary hover:text-charcoal px-4 py-3 rounded-xl font-bold uppercase text-xs text-left transition-all" whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                        {action}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-primary p-6 rounded-[2rem] border-2 border-charcoal">
                            <h3 className="text-lg font-black uppercase italic text-charcoal mb-2">System Status</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="text-xs font-bold text-charcoal/60">Server</span><span className="text-xs font-black text-green-600">Online</span></div>
                                <div className="flex justify-between"><span className="text-xs font-bold text-charcoal/60">Database</span><span className="text-xs font-black text-green-600">Healthy</span></div>
                                <div className="flex justify-between"><span className="text-xs font-bold text-charcoal/60">API</span><span className="text-xs font-black text-green-600">Running</span></div>
                            </div>
                        </div>

                        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem]">
                            <h3 className="text-lg font-black uppercase italic text-red-600 mb-2">Danger Zone</h3>
                            <p className="text-xs text-red-600/70 mb-4">Irreversible actions that require confirmation</p>
                            <motion.button className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-black uppercase text-xs" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                Reset All Data
                            </motion.button>
                        </div>
                    </motion.aside>
                </div>
            </AdminLayout>
        </motion.div>
    );
};

export default AdminSettingsPage;
