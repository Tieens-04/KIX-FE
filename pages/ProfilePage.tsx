import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { pageTransition, fadeInUp } from '../utils/animations';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/userApi';

const ProfilePage: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    const [form, setForm] = useState({
        name: '', phone: '',
        default_address: { recipient_name: '', phone: '', address: '', ward: '', district: '', city: '' }
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDarkMode(savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches));
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        document.documentElement.classList.toggle('light', !isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                phone: user.phone || '',
                default_address: user.default_address || { recipient_name: '', phone: '', address: '', ward: '', district: '', city: '' }
            });
            setAvatarPreview(user.avatar || '');
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('phone', form.phone);
            if (form.default_address) {
                formData.append('default_address', JSON.stringify(form.default_address));
            }
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            await updateProfile(formData);
            setAvatarFile(null);
            setIsEditing(false);
            setToast('Cập nhật thành công!');
            setTimeout(() => setToast(''), 3000);
        } catch (err: any) {
            setToast(err?.message || 'Lỗi cập nhật');
        }
        setSaving(false);
    };

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    const handleAISearch = (e?: React.FormEvent) => { e?.preventDefault(); };

    const roleBadge = {
        admin: { label: 'Admin', color: 'bg-red-500' },
        store_manager: { label: 'Store Manager', color: 'bg-blue-500' },
        customer: { label: 'Customer', color: 'bg-primary text-charcoal' },
    };

    const badge = user ? roleBadge[user.role] : null;

    return (
        <motion.div className="min-h-screen bg-background-light dark:bg-background-dark" initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleAISearch={handleAISearch} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

            {toast && (
                <div className="fixed bottom-8 right-8 z-50 bg-primary text-charcoal px-6 py-4 rounded-full font-black text-sm shadow-xl">
                    {toast}
                </div>
            )}

            <main className="pt-24 pb-20 px-6 md:px-10 max-w-4xl mx-auto">
                <motion.div variants={fadeInUp} initial="initial" animate="animate">
                    <div className="flex items-center gap-6 mb-10">
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">My Profile</h1>
                        <div className="h-[2px] flex-1 bg-charcoal/10 dark:bg-white/10"></div>
                        {badge && (
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full text-white ${badge.color}`}>
                                {badge.label}
                            </span>
                        )}
                    </div>
                </motion.div>

                <motion.div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-8 md:p-12 border border-border-light dark:border-border-dark shadow-xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {/* Email (read-only) */}
                    <div className="mb-8 p-4 bg-background-alt dark:bg-charcoal rounded-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Email</span>
                        <p className="font-black text-lg">{user?.email}</p>
                    </div>

                    {/* Avatar Upload */}
                    <div className="mb-8 flex items-center gap-6">
                        <div className="relative group">
                            <div className="size-24 rounded-full overflow-hidden bg-background-alt dark:bg-charcoal border-4 border-primary/20">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl opacity-30">person</span>
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('avatar-input')?.click()}
                                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                </button>
                            )}
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setAvatarFile(file);
                                        setAvatarPreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Avatar</p>
                            {isEditing ? (
                                <p className="text-xs text-gray-500">Click ảnh để thay đổi (JPG, PNG, WebP, max 2MB)</p>
                            ) : (
                                <p className="text-sm font-bold">{user?.name || 'Chưa cập nhật'}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Họ tên</label>
                            <input
                                className="w-full bg-background-alt dark:bg-charcoal border-none rounded-2xl py-4 px-6 font-bold focus:ring-4 focus:ring-primary/20 disabled:opacity-50"
                                value={form.name} disabled={!isEditing}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Số điện thoại</label>
                            <input
                                className="w-full bg-background-alt dark:bg-charcoal border-none rounded-2xl py-4 px-6 font-bold focus:ring-4 focus:ring-primary/20 disabled:opacity-50"
                                value={form.phone} disabled={!isEditing}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-8">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter mb-4">Địa chỉ giao hàng mặc định</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { key: 'recipient_name', label: 'Người nhận' },
                                { key: 'phone', label: 'SĐT' },
                                { key: 'address', label: 'Địa chỉ' },
                                { key: 'ward', label: 'Phường/Xã' },
                                { key: 'district', label: 'Quận/Huyện' },
                                { key: 'city', label: 'Thành phố' },
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-1">{label}</label>
                                    <input
                                        className="w-full bg-background-alt dark:bg-charcoal border-none rounded-2xl py-3 px-5 font-bold text-sm focus:ring-4 focus:ring-primary/20 disabled:opacity-50"
                                        value={(form.default_address as any)[key] || ''} disabled={!isEditing}
                                        onChange={(e) => setForm({ ...form, default_address: { ...form.default_address, [key]: e.target.value } })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {isEditing ? (
                            <>
                                <motion.button
                                    onClick={handleSave} disabled={saving}
                                    className="flex-1 py-4 bg-primary text-charcoal font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-charcoal hover:text-white transition-all disabled:opacity-50"
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </motion.button>
                                <motion.button
                                    onClick={() => setIsEditing(false)}
                                    className="px-8 py-4 border-2 border-charcoal dark:border-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Hủy
                                </motion.button>
                            </>
                        ) : (
                            <motion.button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 py-4 bg-charcoal dark:bg-primary text-white dark:text-charcoal font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-primary hover:text-charcoal transition-all"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    Chỉnh sửa
                                </span>
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </main>
            <Footer />
        </motion.div>
    );
};

export default ProfilePage;
