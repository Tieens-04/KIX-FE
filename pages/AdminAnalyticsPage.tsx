import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';

// Analytics data
const REVENUE_DATA = {
    weekly: [12500, 18200, 15800, 22100, 19500, 28900, 24500],
    monthly: [85000, 92000, 78000, 105000, 118000, 95000],
};

const TOP_PRODUCTS = [
    { name: 'VaporMax Flyknit', sales: 342, revenue: 64638, growth: 15.2 },
    { name: 'Air Jordan 1 High', sales: 289, revenue: 49130, growth: 8.7 },
    { name: 'Dunk Low Retro', sales: 256, revenue: 28160, growth: 22.4 },
    { name: 'Air Max 270', sales: 198, revenue: 29700, growth: -3.2 },
    { name: 'Yeezy Boost 350', sales: 145, revenue: 33350, growth: 45.8 },
];

const TRAFFIC_SOURCES = [
    { source: 'Organic Search', percentage: 42, color: 'bg-primary' },
    { source: 'Direct', percentage: 28, color: 'bg-charcoal' },
    { source: 'Social Media', percentage: 18, color: 'bg-blue-500' },
    { source: 'Referral', percentage: 8, color: 'bg-purple-500' },
    { source: 'Email', percentage: 4, color: 'bg-orange-500' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AdminAnalyticsPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    const maxRevenue = Math.max(...REVENUE_DATA.weekly);

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <AdminLayout activeNav="Analytics">
                {/* Header */}
                <header className="flex flex-wrap justify-between items-center gap-6 mb-12">
                    <div>
                        <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">Performance Insights</p>
                        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">
                            Store <span className="text-primary">Analytics</span>
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-border-light shadow-sm">
                            {(['7d', '30d', '90d'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-primary' : 'hover:bg-gray-100 opacity-40'
                                        }`}
                                >
                                    {range === '7d' ? 'Week' : range === '30d' ? 'Month' : 'Quarter'}
                                </button>
                            ))}
                        </div>
                        <motion.button
                            className="bg-charcoal text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-charcoal transition-all shadow-xl flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export Report
                        </motion.button>
                    </div>
                </header>

                {/* Key Metrics */}
                <motion.section
                    className="mb-12"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div
                            className="bg-charcoal text-white p-6 rounded-[2rem]"
                            variants={staggerItem}
                            whileHover={{ y: -4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="material-symbols-outlined text-primary text-2xl">payments</span>
                                <span className="text-[10px] font-black text-green-400 bg-green-400/20 px-2 py-1 rounded-full">+18.2%</span>
                            </div>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">Total Revenue</p>
                            <p className="text-4xl font-black italic text-primary">3.562.500K VND</p>
                            <p className="text-xs opacity-50 mt-2">vs 3.010.000K VND last period</p>
                        </motion.div>

                        <motion.div
                            className="bg-white p-6 rounded-[2rem] border border-border-light"
                            variants={staggerItem}
                            whileHover={{ y: -4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="material-symbols-outlined text-blue-500 text-2xl">shopping_bag</span>
                                <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.5%</span>
                            </div>
                            <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">Total Orders</p>
                            <p className="text-4xl font-black italic">1,847</p>
                            <p className="text-xs opacity-40 mt-2">vs 1,642 last period</p>
                        </motion.div>

                        <motion.div
                            className="bg-white p-6 rounded-[2rem] border border-border-light"
                            variants={staggerItem}
                            whileHover={{ y: -4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="material-symbols-outlined text-purple-500 text-2xl">group</span>
                                <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-full">+8.9%</span>
                            </div>
                            <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">New Customers</p>
                            <p className="text-4xl font-black italic">524</p>
                            <p className="text-xs opacity-40 mt-2">vs 481 last period</p>
                        </motion.div>

                        <motion.div
                            className="bg-primary p-6 rounded-[2rem] border-2 border-charcoal"
                            variants={staggerItem}
                            whileHover={{ y: -4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="material-symbols-outlined text-charcoal text-2xl">avg_pace</span>
                                <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-1 rounded-full">-2.1%</span>
                            </div>
                            <p className="text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1">Avg. Order Value</p>
                            <p className="text-4xl font-black italic text-charcoal">1.928.000 VND</p>
                            <p className="text-xs text-charcoal/50 mt-2">vs 1.969.500 VND last period</p>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Revenue Chart */}
                <motion.section
                    className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div
                        className="lg:col-span-8 bg-white p-10 rounded-[3rem] border-4 border-charcoal"
                        style={{ boxShadow: '12px 12px 0px #25f425' }}
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Revenue Trends</h2>
                                <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Daily performance breakdown</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black italic text-primary">3.537.500K VND</p>
                                <p className="text-xs opacity-50">This week</p>
                            </div>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-4 border-b-2 border-charcoal/10 pb-4">
                            {REVENUE_DATA.weekly.map((value, index) => (
                                <motion.div
                                    key={index}
                                    className={`w-full rounded-t-xl relative group cursor-pointer ${index === REVENUE_DATA.weekly.length - 1 ? 'bg-primary' : 'bg-primary/30 hover:bg-primary'
                                        } transition-all`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(value / maxRevenue) * 100}%` }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        ${(value / 1000).toFixed(1)}K
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 px-2">
                            {DAYS.map((day, index) => (
                                <span
                                    key={day}
                                    className={`text-[10px] font-black uppercase tracking-widest ${index === DAYS.length - 1 ? 'text-primary' : 'opacity-30'
                                        }`}
                                >
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Traffic Sources */}
                    <div className="lg:col-span-4 bg-charcoal text-white p-8 rounded-[2.5rem]">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6">Traffic Sources</h3>
                        <div className="space-y-4">
                            {TRAFFIC_SOURCES.map((source, index) => (
                                <motion.div
                                    key={source.source}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold">{source.source}</span>
                                        <span className="text-xs font-black text-primary">{source.percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${source.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${source.percentage}%` }}
                                            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Top Products */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-black tracking-tight uppercase italic">Top Performing Products</h2>
                        <div className="h-[2px] flex-1 bg-charcoal/10"></div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-border-light overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-charcoal text-white">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Rank</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Product Name</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Units Sold</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Revenue</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">Growth</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {TOP_PRODUCTS.map((product, index) => (
                                        <motion.tr
                                            key={product.name}
                                            className="hover:bg-primary/5 transition-colors"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td className="px-8 py-5">
                                                <div className={`size-8 rounded-lg flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-charcoal text-white' : 'bg-gray-100'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-black italic uppercase text-sm">{product.name}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-bold">{product.sales.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-black text-lg">${product.revenue.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={`flex items-center gap-1 ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    <span className="material-symbols-outlined text-sm">
                                                        {product.growth >= 0 ? 'trending_up' : 'trending_down'}
                                                    </span>
                                                    <span className="font-black text-sm">{Math.abs(product.growth)}%</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.section>

                {/* Quick Stats Row */}
                <motion.section
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pb-20"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {[
                        { label: 'Conversion Rate', value: '3.42%', change: '+0.8%', positive: true, icon: 'conversion_path' },
                        { label: 'Cart Abandonment', value: '68.5%', change: '-2.3%', positive: true, icon: 'remove_shopping_cart' },
                        { label: 'Customer Lifetime Value', value: '7.100.000 VND', change: '+300.000 VND', positive: true, icon: 'diamond' },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            className="bg-white p-6 rounded-3xl border border-border-light relative overflow-hidden group"
                            variants={staggerItem}
                            whileHover={{ y: -4 }}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full group-hover:w-full group-hover:h-full group-hover:rounded-none transition-all duration-500"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary">{stat.icon}</span>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40">{stat.label}</h4>
                                </div>
                                <p className="text-4xl font-black italic mb-2">{stat.value}</p>
                                <div className={`flex items-center gap-2 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                                    <span className="material-symbols-outlined text-sm">
                                        {stat.positive ? 'trending_up' : 'trending_down'}
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-tight">{stat.change}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.section>
            </AdminLayout>
        </motion.div>
    );
};

export default AdminAnalyticsPage;
