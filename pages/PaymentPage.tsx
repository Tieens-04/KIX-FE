import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import { navigateWithTransition } from '../components/PageTransition';
import { pageTransition } from '../utils/animations';
import { cartApi } from '../services/cartApi';
import { orderApi } from '../services/orderApi';
import { useAuth } from '../context/AuthContext';
import danangData from '../utils/province';

interface CartDisplayItem {
    id: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    image: string;
}

const InputField = ({ label, value, onChange, placeholder, required, maxLength, type = 'text' }: {
    label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; required?: boolean; maxLength?: number; type?: string;
}) => (
    <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40 dark:text-white/40">
            {label} {required && <span className="text-red-500">*</span>}
        </span>
        <input
            className="w-full bg-background-alt dark:bg-charcoal border-2 border-gray-100 dark:border-border-dark rounded-2xl px-5 py-4 text-sm font-bold placeholder:opacity-30 focus:border-primary focus:ring-0 transition-colors"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
        />
    </label>
);

const SelectField = ({ label, value, onChange, options, placeholder, required, disabled }: {
    label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[]; placeholder?: string; required?: boolean; disabled?: boolean;
}) => (
    <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-charcoal/40 dark:text-white/40">
            {label} {required && <span className="text-red-500">*</span>}
        </span>
        <select
            className="w-full bg-background-alt dark:bg-charcoal border-2 border-gray-100 dark:border-border-dark rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary focus:ring-0 transition-colors appearance-none cursor-pointer disabled:opacity-50"
            value={value}
            onChange={onChange}
            disabled={disabled}
        >
            <option value="">{placeholder || '-- Chọn --'}</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </label>
);

const PaymentPage: React.FC = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const { user } = useAuth();

    // Shipping
    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [ward, setWard] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState(danangData.tinh);

    // Derived options from danangData
    const districtOptions = danangData.quan_huyen.map(qh => ({ value: qh.ten, label: qh.ten }));
    const selectedDistrict = danangData.quan_huyen.find(qh => qh.ten === district);
    const wardOptions = selectedDistrict
        ? selectedDistrict.phuong_xa.map(px => ({ value: px.ten, label: px.ten }))
        : [];

    // Payment
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    // State
    const [items, setItems] = useState<CartDisplayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Pre-fill from user
    useEffect(() => {
        if (user) {
            const da: any = user.default_address || {};
            setRecipientName(da.recipient_name || user.name || '');
            setPhone(da.phone || user.phone || '');
            setAddress(da.address || '');
            setWard(da.ward || '');
            setDistrict(da.district || '');
            setCity(danangData.tinh);
        }
    }, [user]);

    // Fetch cart
    useEffect(() => {
        (async () => {
            try {
                const res = await cartApi.get();
                setItems((res.data?.items || []).map((i: any) => ({
                    id: i._id,
                    name: i.product_id?.name || 'Sản phẩm',
                    size: i.sku_id?.size ? String(i.sku_id.size) : '',
                    color: i.sku_id?.color || '',
                    price: i.price || 0,
                    quantity: i.quantity || 1,
                    image: i.product_id?.images?.[0]?.url || '',
                })));
            } catch (e) { console.error(e); }
            setLoading(false);
        })();
    }, []);

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const goToPayment = () => {
        setError('');
        if (!recipientName.trim()) return setError('Vui lòng nhập tên người nhận.');
        if (!/^0\d{9}$/.test(phone.trim())) return setError('SĐT phải gồm 10 chữ số, bắt đầu bằng 0.');
        if (!address.trim()) return setError('Vui lòng nhập địa chỉ.');
        if (!district) return setError('Vui lòng chọn Quận/Huyện.');
        if (!ward) return setError('Vui lòng chọn Phường/Xã.');
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const placeOrder = async () => {
        setError('');
        setProcessing(true);
        try {
            await orderApi.checkout({
                shipping_address: {
                    recipient_name: recipientName.trim(),
                    phone: phone.trim(),
                    address: address.trim(),
                    ward: ward.trim(),
                    district: district.trim(),
                    city: city.trim(),
                },
                payment_method: 'credit_card',
            });
            setSuccess(true);
        } catch (err: any) {
            const msgs = err?.error;
            setError(Array.isArray(msgs) ? msgs.join('. ') : (err?.message || 'Đặt hàng thất bại.'));
            setProcessing(false);
        }
    };

    // ── Success Screen ──
    if (success) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-6">
                <motion.div
                    className="text-center max-w-md"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                >
                    <div className="size-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
                        <span className="material-symbols-outlined text-charcoal text-5xl">check</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-3">Đặt Hàng Thành Công!</h1>
                    <p className="text-sm opacity-60 mb-10">Đơn hàng của bạn đã được tạo. Bạn có thể theo dõi tại trang đơn hàng.</p>
                    <div className="flex gap-4 justify-center">
                        <motion.button
                            onClick={() => navigateWithTransition('/orders')}
                            className="px-8 py-4 bg-charcoal dark:bg-primary text-white dark:text-charcoal rounded-2xl text-xs font-black uppercase tracking-widest"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            Xem đơn hàng
                        </motion.button>
                        <motion.button
                            onClick={() => navigateWithTransition('/sneakers')}
                            className="px-8 py-4 border-2 border-charcoal dark:border-white rounded-2xl text-xs font-black uppercase tracking-widest"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            Tiếp tục mua
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }


    return (
        <motion.div
            className="min-h-screen bg-background-light dark:bg-background-dark"
            initial="initial" animate="animate" exit="exit" variants={pageTransition}
        >
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-charcoal border-b border-border-light dark:border-border-dark px-8 h-16 flex items-center justify-between shadow-sm">
                <a href="/" onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }} className="flex items-center gap-3 group">
                    <div className="size-8 bg-charcoal dark:bg-primary rounded-lg flex items-center justify-center text-primary dark:text-charcoal shadow-sm group-hover:bg-primary group-hover:text-charcoal dark:group-hover:bg-charcoal dark:group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined font-bold text-xl">bolt</span>
                    </div>
                    <h2 className="text-xl font-black tracking-tighter uppercase italic">KIX</h2>
                </a>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Secure Checkout
                </div>
            </header>

            <main className="pt-24 pb-16 px-6 md:px-10 max-w-[1300px] mx-auto">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[
                        { n: 1, label: 'Giao hàng', icon: 'local_shipping' },
                        { n: 2, label: 'Thanh toán', icon: 'credit_card' },
                    ].map((s, i) => (
                        <React.Fragment key={s.n}>
                            {i > 0 && (
                                <div className={`w-16 h-0.5 ${step >= s.n ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} transition-colors`} />
                            )}
                            <button
                                onClick={() => s.n === 1 && step === 2 ? setStep(1) : undefined}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                    step === s.n
                                        ? 'bg-charcoal dark:bg-primary text-white dark:text-charcoal shadow-lg'
                                        : step > s.n
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                                } ${s.n === 1 && step === 2 ? 'cursor-pointer hover:opacity-80' : ''}`}
                            >
                                {step > s.n ? (
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                ) : (
                                    <span className="material-symbols-outlined text-sm">{s.icon}</span>
                                )}
                                {s.label}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <motion.div
                        className="max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3"
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
                    {/* ═══ LEFT COLUMN ═══ */}
                    <div>
                        {/* ── STEP 1: SHIPPING ── */}
                        {step === 1 && (
                            <motion.div
                                className="bg-white dark:bg-card-dark rounded-[2rem] border-2 border-gray-100 dark:border-border-dark p-8 md:p-10 shadow-sm"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            >
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-1 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                                    Thông tin giao hàng
                                </h2>
                                <p className="text-xs font-bold opacity-40 mb-8">Nhập địa chỉ nhận hàng của bạn</p>

                                <div className="space-y-5">
                                    <InputField label="Tên người nhận" required placeholder="Nguyễn Văn A" value={recipientName} onChange={(e: any) => setRecipientName(e.target.value)} />
                                    <InputField label="Số điện thoại (10 chữ số)" required placeholder="0901234567" value={phone} onChange={(e: any) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} />
                                    <div className="grid grid-cols-3 gap-4">
                                        <InputField label="Thành phố" value={city} onChange={() => {}} />
                                        <SelectField label="Quận/Huyện" required placeholder="-- Chọn Quận/Huyện --" value={district} onChange={(e: any) => { setDistrict(e.target.value); setWard(''); }} options={districtOptions} />
                                        <SelectField label="Phường/Xã" required placeholder="-- Chọn Phường/Xã --" value={ward} onChange={(e: any) => setWard(e.target.value)} options={wardOptions} disabled={!district} />
                                    </div>
                                    <InputField label="Số nhà Tên đường" required placeholder="123 Đường Nguyễn Huệ" value={address} onChange={(e: any) => setAddress(e.target.value)} />
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <motion.button
                                        onClick={() => navigateWithTransition('/cart')}
                                        className="flex-1 py-4 border-2 border-charcoal dark:border-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="material-symbols-outlined text-sm">west</span>
                                        Giỏ hàng
                                    </motion.button>
                                    <motion.button
                                        onClick={goToPayment}
                                        className="flex-[1.5] py-4 bg-primary text-charcoal rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all"
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    >
                                        Tiếp tục thanh toán
                                        <span className="material-symbols-outlined text-sm">east</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: PAYMENT ── */}
                        {step === 2 && (
                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            >
                                {/* Shipping Summary */}
                                <div className="bg-green-50 dark:bg-green-900/10 border-2 border-primary/30 rounded-2xl p-5 flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Giao đến</p>
                                            <p className="text-sm font-black">{recipientName} — {phone}</p>
                                            <p className="text-xs opacity-60">{[address, ward, district, city].filter(Boolean).join(', ')}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setStep(1); setError(''); }} className="text-[10px] font-black uppercase text-primary hover:underline flex-shrink-0">Sửa</button>
                                </div>

                                {/* Payment Card Form */}
                                <div className="bg-white dark:bg-card-dark rounded-[2rem] border-2 border-gray-100 dark:border-border-dark p-8 md:p-10 shadow-sm">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-1 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">credit_card</span>
                                        Thanh toán
                                    </h2>
                                    <p className="text-xs font-bold opacity-40 mb-8">Nhập thông tin thẻ để hoàn tất</p>

                                    <div className="space-y-5">
                                        <InputField label="Tên chủ thẻ" placeholder="NGUYEN VAN A" value={cardName} onChange={(e: any) => setCardName(e.target.value)} />
                                        <InputField label="Số thẻ" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e: any) => setCardNumber(e.target.value)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Ngày hết hạn" placeholder="MM/YY" value={expiry} onChange={(e: any) => setExpiry(e.target.value)} />
                                            <InputField label="CVV" placeholder="•••" value={cvv} onChange={(e: any) => setCvv(e.target.value)} maxLength={4} />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 mt-8">
                                        <motion.button
                                            onClick={() => { setStep(1); setError(''); }}
                                            className="flex-1 py-4 border-2 border-charcoal dark:border-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="material-symbols-outlined text-sm">west</span>
                                            Quay lại
                                        </motion.button>
                                        <motion.button
                                            onClick={placeOrder}
                                            disabled={processing}
                                            className="flex-[1.5] py-4 bg-charcoal dark:bg-primary text-white dark:text-charcoal rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-primary hover:text-charcoal dark:hover:bg-white transition-all disabled:opacity-50"
                                            whileHover={{ scale: processing ? 1 : 1.02 }}
                                            whileTap={{ scale: processing ? 1 : 0.98 }}
                                        >
                                            {processing ? (
                                                <>
                                                    <motion.span className="material-symbols-outlined text-sm" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    Hoàn tất — ${total.toFixed(2)}
                                                    <span className="material-symbols-outlined text-sm">east</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Other payment methods */}
                                <div className="grid grid-cols-3 gap-3">
                                    {['PayPal', 'Apple Pay', 'VNPay'].map(m => (
                                        <button key={m} className="py-3 border-2 border-gray-100 dark:border-border-dark rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:border-primary transition-all">
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ═══ RIGHT: ORDER SUMMARY ═══ */}
                    <div>
                        <div className="bg-charcoal dark:bg-card-dark text-white p-8 rounded-[2rem] sticky top-24 shadow-2xl border border-charcoal dark:border-border-dark">
                            <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6 flex justify-between items-center">
                                Đơn hàng
                                <span className="text-[10px] bg-primary text-charcoal px-2.5 py-1 rounded-full">{items.length} SP</span>
                            </h3>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <motion.span className="material-symbols-outlined text-primary text-2xl" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>sync</motion.span>
                                </div>
                            ) : items.length === 0 ? (
                                <p className="text-center py-8 text-xs opacity-40 uppercase tracking-widest">Giỏ hàng trống</p>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
                                        {items.map(item => (
                                            <div key={item.id} className="flex gap-3">
                                                <div className="size-14 bg-white/10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-xl opacity-30">steps</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black uppercase italic truncate">{item.name}</p>
                                                    <p className="text-[9px] opacity-40 uppercase tracking-widest">
                                                        {item.size && `Size ${item.size}`}{item.color && ` • ${item.color}`} • x{item.quantity}
                                                    </p>
                                                    <p className="text-xs font-black text-primary mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 border-t border-white/10 pt-5 mb-5 text-[10px] font-black uppercase tracking-widest">
                                        <div className="flex justify-between opacity-40">
                                            <span>Tạm tính</span><span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between opacity-40">
                                            <span>Phí ship</span><span className="text-primary italic">Miễn phí</span>
                                        </div>
                                        <div className="flex justify-between opacity-40">
                                            <span>Thuế (8%)</span><span>${tax.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/10 pt-5">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Tổng cộng</span>
                                        <span className="text-3xl font-black italic text-primary">${total.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-16"><Footer /></div>
            </main>
        </motion.div>
    );
};

export default PaymentPage;
