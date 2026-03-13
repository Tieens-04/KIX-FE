import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';
import { userApi } from '../services/userApi';
import { User } from '../types';

const ROLE_BADGES: Record<string, React.ReactNode> = {
    admin: <span className="px-3 py-1 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full">Admin</span>,
    store_manager: <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full">Manager</span>,
    customer: <span className="px-3 py-1 bg-primary text-charcoal text-[9px] font-black uppercase tracking-widest rounded-full">Customer</span>,
};

const AdminCustomersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [updatingRole, setUpdatingRole] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll({
                page, limit: 15,
                role: filterRole !== 'all' ? filterRole : undefined,
                search: searchQuery || undefined,
            });
            setUsers(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, [page, filterRole]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingRole(userId);
        try {
            await userApi.updateRole(userId, newRole);
            fetchUsers();
        } catch (err: any) {
            alert(err?.message || 'Lỗi cập nhật role');
        }
        setUpdatingRole('');
    };

    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const managerCount = users.filter(u => u.role === 'store_manager').length;
    const customerCount = users.filter(u => u.role === 'customer').length;

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <AdminLayout activeNav="Customers">
                <header className="flex flex-wrap justify-between items-center gap-6 mb-12">
                    <div>
                        <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">User Management</p>
                        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">Quản Lý <span className="text-primary">Users</span></h1>
                    </div>
                </header>

                {/* Stats */}
                <motion.section className="mb-10" variants={staggerContainer} initial="initial" animate="animate">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <motion.div className="bg-charcoal text-white p-6 rounded-[2rem]" variants={staggerItem}>
                            <span className="material-symbols-outlined text-primary text-2xl mb-3">group</span>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">Total Users</p>
                            <p className="text-4xl font-black italic text-primary">{totalUsers}</p>
                        </motion.div>
                        <motion.div className="bg-white p-6 rounded-[2rem] border border-border-light" variants={staggerItem}>
                            <span className="material-symbols-outlined text-red-500 text-2xl mb-3">admin_panel_settings</span>
                            <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">Admin</p>
                            <p className="text-4xl font-black italic">{adminCount}</p>
                        </motion.div>
                        <motion.div className="bg-white p-6 rounded-[2rem] border border-border-light" variants={staggerItem}>
                            <span className="material-symbols-outlined text-blue-500 text-2xl mb-3">store</span>
                            <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">Managers</p>
                            <p className="text-4xl font-black italic">{managerCount}</p>
                        </motion.div>
                        <motion.div className="bg-primary p-6 rounded-[2rem] border-2 border-charcoal" variants={staggerItem}>
                            <span className="material-symbols-outlined text-charcoal text-2xl mb-3">person</span>
                            <p className="text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1">Customers</p>
                            <p className="text-4xl font-black italic text-charcoal">{customerCount}</p>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Search & Filter */}
                <section className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <form onSubmit={handleSearch} className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30">search</span>
                            <input type="text" placeholder="Tìm theo email, tên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-white border border-border-light rounded-full text-xs font-bold w-64 focus:ring-2 focus:ring-primary" />
                        </form>
                        <div className="flex gap-2">
                            {['all', 'admin', 'store_manager', 'customer'].map((role) => (
                                <button key={role} onClick={() => { setFilterRole(role); setPage(1); }}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${filterRole === role ? 'bg-primary' : 'bg-gray-100 hover:bg-primary/20'}`}
                                >
                                    {role === 'all' ? 'Tất cả' : role === 'store_manager' ? 'Manager' : role}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Table */}
                <section className="pb-20">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <motion.span className="material-symbols-outlined text-4xl text-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] border border-border-light overflow-hidden shadow-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-charcoal text-white">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase">User</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase">Phone</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase">Role</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase">Joined</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase">Change Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => {
                                        const uid = user._id || user.id;
                                        return (
                                            <tr key={uid} className="hover:bg-primary/5 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div>
                                                        <p className="font-black uppercase text-sm">{user.name || 'No name'}</p>
                                                        <p className="text-[10px] opacity-50">{user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold">{user.phone || '—'}</span>
                                                </td>
                                                <td className="px-8 py-5">{ROLE_BADGES[user.role] || user.role}</td>
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold opacity-60">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(uid, e.target.value)}
                                                        disabled={updatingRole === uid}
                                                        className="px-3 py-2 border border-border-light rounded-xl text-[10px] font-black uppercase focus:ring-2 focus:ring-primary disabled:opacity-50 bg-white"
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="store_manager">Store Manager</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 bg-white border border-border-light rounded-xl font-black text-xs disabled:opacity-30">Trước</button>
                            <span className="text-xs font-black">{page} / {totalPages}</span>
                            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white border border-border-light rounded-xl font-black text-xs disabled:opacity-30">Sau</button>
                        </div>
                    )}
                </section>
            </AdminLayout>
        </motion.div>
    );
};

export default AdminCustomersPage;
