import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { navigateWithTransition } from '../components/PageTransition';
import { pageTransition } from '../utils/animations';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password || !confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (!agreeTerms) {
            setError('Vui lòng đồng ý với điều khoản sử dụng');
            return;
        }

        setIsLoading(true);
        try {
            await register(email, password, fullName);
            navigateWithTransition('/login');
        } catch (err: any) {
            setError(err?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-background-light"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <div className="flex min-h-screen flex-col lg:flex-row">
                {/* Left Side - Hero Image */}
                <div className="relative w-full lg:w-1/2 min-h-[400px] lg:min-h-screen flex items-center justify-center overflow-hidden">
                    <img
                        alt="Streetwear Lifestyle"
                        className="absolute inset-0 w-full h-full object-cover scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20"
                    />
                    <div className="absolute inset-0 bg-charcoal/30 backdrop-grayscale-[0.5]"></div>
                    <div className="absolute top-0 right-0 w-full h-full bg-primary/20 opacity-60" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}></div>

                    {/* Logo & Text */}
                    <motion.div
                        className="absolute top-20 left-10 p-8 z-20"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <motion.div
                                className="size-12 bg-primary rounded-2xl flex items-center justify-center text-charcoal shadow-[0_0_30px_rgba(37,244,37,0.6)] rotate-[-6deg]"
                                whileHover={{ rotate: -12, scale: 1.1 }}
                            >
                                <span className="material-symbols-outlined text-3xl font-black">bolt</span>
                            </motion.div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white drop-shadow-lg">KIX</h1>
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-6xl font-black text-white leading-none mb-6 italic tracking-tighter">
                                START YOUR <br /><span className="text-primary">JOURNEY.</span>
                            </h2>
                            <p className="text-white/80 font-bold uppercase tracking-widest text-sm border-l-4 border-primary pl-4">
                                Join 50K+ sneakerheads. Get early access to exclusive drops.
                            </p>
                        </div>
                    </motion.div>

                    {/* Member Badge */}
                    <motion.div
                        className="absolute bottom-10 left-10 z-20 bg-primary text-charcoal px-6 py-4 rounded-xl shadow-2xl rotate-[2deg] flex items-center gap-4"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className="material-symbols-outlined text-3xl">group</span>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Community Members</p>
                            <p className="text-lg font-black italic">50,000+</p>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Register Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-white relative">
                    {/* Back to Shop */}
                    <div className="absolute top-10 right-10">
                        <a
                            href="/"
                            onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }}
                            className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center gap-2"
                        >
                            Back to Shop <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    <motion.div
                        className="w-full max-w-md"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Header */}
                        <div className="mb-10">
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Create Account</h3>
                            <p className="text-gray-500 font-medium">Join the community and unlock exclusive features.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Form */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <motion.div
                                className="relative group"
                                whileHover={{ y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-4">Full Name</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100">person</span>
                                    <input
                                        className="w-full bg-background-alt border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-charcoal focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-charcoal/20"
                                        placeholder="Alex Streeter"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            {/* Email */}
                            <motion.div
                                className="relative group"
                                whileHover={{ y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-4">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100">alternate_email</span>
                                    <input
                                        className="w-full bg-background-alt border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-charcoal focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-charcoal/20"
                                        placeholder="sneakerhead@kit.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div
                                className="relative group"
                                whileHover={{ y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-4">Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100">lock</span>
                                    <input
                                        className="w-full bg-background-alt border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-charcoal focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-charcoal/20"
                                        placeholder="••••••••••••"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            {/* Confirm Password */}
                            <motion.div
                                className="relative group"
                                whileHover={{ y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-4">Confirm Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100">lock_open</span>
                                    <input
                                        className="w-full bg-background-alt border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-charcoal focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-charcoal/20"
                                        placeholder="••••••••••••"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            {/* Terms Checkbox */}
                            <div className="px-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        className="rounded border-gray-300 text-primary focus:ring-primary mt-1"
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                    />
                                    <span className="text-xs font-bold text-charcoal/60 group-hover:text-charcoal transition-colors leading-relaxed">
                                        I agree to the <a href="#" className="text-primary hover:underline font-black">Terms of Service</a> and <a href="#" className="text-primary hover:underline font-black">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 space-y-4">
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-charcoal py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-charcoal hover:text-white transition-all shadow-[0_15px_30px_rgba(37,244,37,0.2)] relative overflow-hidden group disabled:opacity-50"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {isLoading ? (
                                            <>
                                                <motion.span
                                                    className="material-symbols-outlined text-lg"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    sync
                                                </motion.span>
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                            </>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-charcoal translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </motion.button>

                                {/* Divider */}
                                <div className="flex items-center gap-4 py-4">
                                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Or Sign Up With</span>
                                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                                </div>

                                {/* Social Buttons */}
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        type="button"
                                        className="flex items-center justify-center gap-3 py-4 border-2 border-border-light rounded-2xl hover:border-charcoal transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="material-symbols-outlined text-lg">brand_awareness</span>
                                        <span className="text-xs font-black uppercase tracking-widest">Google</span>
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        className="flex items-center justify-center gap-3 py-4 border-2 border-border-light rounded-2xl hover:border-charcoal transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="material-symbols-outlined text-lg">ios</span>
                                        <span className="text-xs font-black uppercase tracking-widest">Apple</span>
                                    </motion.button>
                                </div>
                            </div>
                        </form>

                        {/* Login Link */}
                        <div className="mt-10 text-center">
                            <p className="text-sm font-medium text-gray-400">
                                Already have an account?
                                <a
                                    href="/login"
                                    onClick={(e) => { e.preventDefault(); navigateWithTransition('/login'); }}
                                    className="text-charcoal font-black uppercase tracking-widest ml-2 hover:text-primary transition-colors border-b-2 border-primary pb-1"
                                >
                                    Sign In
                                </a>
                            </p>
                        </div>
                    </motion.div>

                    {/* Background Blurs */}
                    <div className="absolute -bottom-20 -left-20 size-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
                    <div className="absolute top-20 -right-10 size-40 bg-primary/10 rounded-full blur-[80px] -z-10"></div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white py-8 px-12 border-t border-border-light">
                <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-8 bg-charcoal rounded-lg flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg font-black">bolt</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">© 2024 KIX Lab</p>
                    </div>
                    <div className="flex gap-8">
                        <a className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all" href="#">Privacy</a>
                        <a className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all" href="#">Terms</a>
                        <a className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all" href="#">Cookies</a>
                    </div>
                </div>
            </footer>
        </motion.div>
    );
};

export default RegisterPage;
