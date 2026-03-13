import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import Footer from '../components/Footer';
import { navigateWithTransition } from '../components/PageTransition';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';
import { formatPrice } from '../utils/formatPrice';
import { orderApi } from '../services/orderApi';
import { productApi } from '../services/productApi';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

const EXPERIENCE_TAGS = ['Fast Shipping', 'Easy Checkout', 'Great Support', 'Packaging'];

const PaymentResultsPage: React.FC = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({});
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showConfetti, setShowConfetti] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submittingReviews, setSubmittingReviews] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());
    const [perItemStatus, setPerItemStatus] = useState<Record<number, { success?: boolean; error?: string }>>({});

    // Read VNPay return params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const vnpayStatus = urlParams.get('status');
    const vnpayOrderId = urlParams.get('orderId');
    const isPaymentFailed = vnpayStatus === 'failed';

    // Fetch real order data
    useEffect(() => {
        if (!vnpayOrderId || isPaymentFailed) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        const fetchOrder = async () => {
            try {
                const res = await orderApi.getById(vnpayOrderId);
                if (!cancelled) setOrder(res.data);
            } catch {
                if (!cancelled) setError('Không thể tải thông tin đơn hàng.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchOrder();
        return () => { cancelled = true; };
    }, [vnpayOrderId, isPaymentFailed]);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const getProductId = (item: any): string => {
        const pid = typeof item.product_id === 'object'
            ? (item.product_id._id || item.product_id.id || item.product_id)
            : item.product_id;
        return String(pid);
    };

    // Fetch existing reviews to detect already-reviewed products
    useEffect(() => {
        if (!order) return;
        const checkExistingReviews = async () => {
            const reviewed = new Set<string>();
            for (const item of order.items) {
                if (!item.product_id) continue;
                const pid = getProductId(item);
                try {
                    const res = await productApi.getReviews(pid);
                    const myReview = (res.data || []).find((r: any) =>
                        r.user_id?._id === user?.id || r.user_id === user?.id
                    );
                    if (myReview) reviewed.add(pid);
                } catch { /* ignore */ }
            }
            if (reviewed.size > 0) setReviewedProductIds(reviewed);
        };
        checkExistingReviews();
    }, [order, user]);

    // ── Failed payment screen ──
    if (isPaymentFailed) {
        return (
            <motion.div
                className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-6"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
                <div className="text-center max-w-md">
                    <motion.div
                        className="size-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/30"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}
                    >
                        <span className="material-symbols-outlined text-white text-5xl">close</span>
                    </motion.div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-3">Thanh Toán Thất Bại</h1>
                    <p className="text-sm opacity-60 mb-10">Giao dịch không thành công. Đơn hàng đã được hủy và tồn kho đã được hoàn lại.</p>
                    <div className="flex gap-4 justify-center">
                        <motion.button
                            onClick={() => navigateWithTransition('/payment')}
                            className="px-8 py-4 bg-charcoal dark:bg-primary text-white dark:text-charcoal rounded-2xl text-xs font-black uppercase tracking-widest"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            Thử lại
                        </motion.button>
                        <motion.button
                            onClick={() => navigateWithTransition('/cart')}
                            className="px-8 py-4 border-2 border-charcoal dark:border-white rounded-2xl text-xs font-black uppercase tracking-widest"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            Giỏ hàng
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── Loading screen ──
    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <motion.div
                    className="size-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            </div>
        );
    }

    // ── Error screen ──
    if (error || !order) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">error</span>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-3">{error || 'Không tìm thấy đơn hàng'}</h1>
                    <motion.button
                        onClick={() => navigateWithTransition('/orders')}
                        className="mt-6 px-8 py-4 bg-charcoal dark:bg-primary text-white dark:text-charcoal rounded-2xl text-xs font-black uppercase tracking-widest"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        Xem đơn hàng
                    </motion.button>
                </div>
            </div>
        );
    }

    // ── Derived data from real order ──
    const orderItems = order.items;
    const subtotal = order.subtotal ?? orderItems.reduce((sum, item) => sum + (item.subtotal ?? item.price * item.quantity), 0);
    const tax = order.tax ?? Math.round(subtotal * 0.08);
    const discountAmount = order.discount_amount || 0;
    const promoCode = order.promo_code || null;
    const total = order.total;
    const orderNumber = order.order_number;
    const email = order.customer_email || user?.email || '';
    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    const estimatedDelivery = new Date(createdAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
    const deliveryDate = estimatedDelivery.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const handleRating = (index: number, rating: number) => {
        setReviews(prev => ({
            ...prev,
            [index]: { rating, comment: prev[index]?.comment || '' }
        }));
    };

    const handleComment = (index: number, comment: string) => {
        setReviews(prev => ({
            ...prev,
            [index]: { rating: prev[index]?.rating || 0, comment }
        }));
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmitReviews = async () => {
        type ReviewEntry = { rating: number; comment: string };
        const reviewEntries = (Object.entries(reviews) as [string, ReviewEntry][]).filter(
            ([, r]) => r.rating > 0 && r.comment?.trim()
        );
        if (reviewEntries.length === 0) {
            setReviewError('Vui long chon sao va nhap nhan xet cho it nhat 1 san pham.');
            return;
        }
        setSubmittingReviews(true);
        setReviewError('');
        setPerItemStatus({});
        const newStatus: Record<number, { success?: boolean; error?: string }> = {};
        let hasError = false;

        for (const [indexStr, review] of reviewEntries) {
            const idx = Number(indexStr);
            const item = orderItems[idx];
            if (!item?.product_id) continue;
            const productId = getProductId(item);

            if (reviewedProductIds.has(productId)) {
                newStatus[idx] = { error: 'Ban da danh gia san pham nay roi' };
                hasError = true;
                continue;
            }

            try {
                await productApi.addReview(productId, {
                    rating: review.rating,
                    comment: review.comment.trim(),
                });
                newStatus[idx] = { success: true };
                setReviewedProductIds(prev => new Set(prev).add(productId));
            } catch (err: any) {
                const msg = err?.message || 'Khong the gui danh gia';
                newStatus[idx] = { error: msg };
                hasError = true;
            }
        }

        setPerItemStatus(newStatus);
        setSubmittingReviews(false);
        if (!hasError) {
            setReviewSuccess(true);
        } else {
            const errorMessages = Object.entries(newStatus)
                .filter(([, s]) => s.error)
                .map(([idx, s]) => `${orderItems[Number(idx)]?.product_name || 'Product'}: ${s.error}`);
            setReviewError(errorMessages.join('. '));
        }
    };

    // ── Download Invoice as PDF ──
    const handleDownloadInvoice = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        // Header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('KIX', 20, y);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('INVOICE', pageWidth - 20, y, { align: 'right' });
        y += 15;

        // Divider
        doc.setDrawColor(200);
        doc.line(20, y, pageWidth - 20, y);
        y += 12;

        // Order info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Number:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(orderNumber, 70, y);
        doc.setFont('helvetica', 'bold');
        doc.text('Date:', pageWidth / 2 + 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(createdAt.toLocaleDateString('vi-VN'), pageWidth / 2 + 30, y);
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.text('Payment:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(order.payment_method === 'vnpay' ? 'VNPay' : (order.payment_method || 'N/A'), 70, y);
        doc.setFont('helvetica', 'bold');
        doc.text('Status:', pageWidth / 2 + 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(order.payment_status === 'success' ? 'Paid' : (order.payment_status || 'N/A'), pageWidth / 2 + 30, y);
        y += 12;

        // Customer info
        doc.setFont('helvetica', 'bold');
        doc.text('Customer:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(order.shipping_address?.recipient_name || '', 70, y);
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.text('Phone:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(order.shipping_address?.phone || order.customer_phone || '', 70, y);
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.text('Email:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(email, 70, y);
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.text('Address:', 20, y);
        doc.setFont('helvetica', 'normal');
        const addr = order.shipping_address;
        const fullAddress = [addr?.address, addr?.ward, addr?.district, addr?.city].filter(Boolean).join(', ');
        const addressLines = doc.splitTextToSize(fullAddress, pageWidth - 90);
        doc.text(addressLines, 70, y);
        y += addressLines.length * 6 + 10;

        // Table header
        doc.setFillColor(34, 34, 34);
        doc.rect(20, y, pageWidth - 40, 10, 'F');
        doc.setTextColor(255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUCT', 25, y + 7);
        doc.text('SIZE', 95, y + 7);
        doc.text('QTY', 115, y + 7);
        doc.text('PRICE', 135, y + 7);
        doc.text('SUBTOTAL', pageWidth - 25, y + 7, { align: 'right' });
        y += 14;
        doc.setTextColor(0);

        // Table rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        orderItems.forEach((item, i) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            const bgColor = i % 2 === 0 ? 248 : 255;
            doc.setFillColor(bgColor, bgColor, bgColor);
            doc.rect(20, y - 4, pageWidth - 40, 10, 'F');

            const name = item.product_name || 'Product';
            const truncatedName = name.length > 30 ? name.substring(0, 27) + '...' : name;
            doc.text(truncatedName, 25, y + 2);
            doc.text(item.size != null ? String(item.size) : '-', 95, y + 2);
            doc.text(String(item.quantity), 115, y + 2);
            doc.text(formatPrice(item.price), 135, y + 2);
            doc.text(formatPrice(item.subtotal ?? item.price * item.quantity), pageWidth - 25, y + 2, { align: 'right' });
            y += 10;
        });

        y += 5;
        doc.setDrawColor(200);
        doc.line(pageWidth / 2 + 20, y, pageWidth - 20, y);
        y += 10;

        // Totals
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', pageWidth / 2 + 25, y);
        doc.text(formatPrice(subtotal), pageWidth - 25, y, { align: 'right' });
        y += 7;
        doc.text('Shipping:', pageWidth / 2 + 25, y);
        doc.text('Free', pageWidth - 25, y, { align: 'right' });
        y += 7;
        doc.text('Tax (8%):', pageWidth / 2 + 25, y);
        doc.text(formatPrice(tax), pageWidth - 25, y, { align: 'right' });
        y += 7;

        if (discountAmount > 0) {
            doc.setTextColor(0, 128, 0);
            doc.text(`Discount${promoCode ? ` (${promoCode})` : ''}:`, pageWidth / 2 + 25, y);
            doc.text(`-${formatPrice(discountAmount)}`, pageWidth - 25, y, { align: 'right' });
            doc.setTextColor(0);
            y += 7;
        }
        y += 3;

        doc.setDrawColor(200);
        doc.line(pageWidth / 2 + 20, y, pageWidth - 20, y);
        y += 8;

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL:', pageWidth / 2 + 25, y);
        doc.text(formatPrice(total), pageWidth - 25, y, { align: 'right' });
        y += 20;

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130);
        doc.text('Thank you for shopping with KIX!', pageWidth / 2, y, { align: 'center' });

        doc.save(`KIX-Invoice-${orderNumber}.pdf`);
    };

    return (
        <motion.div
            className="min-h-screen bg-background-light dark:bg-background-dark"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            {/* Confetti Animation */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
                        {[...Array(50)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-3 h-3 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    backgroundColor: ['#25f425', '#111811', '#ffffff'][Math.floor(Math.random() * 3)],
                                }}
                                initial={{ y: -20, opacity: 1 }}
                                animate={{
                                    y: '100vh',
                                    rotate: Math.random() * 720,
                                    opacity: 0,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    delay: Math.random() * 0.5,
                                    ease: 'easeIn',
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-charcoal border-b border-border-light dark:border-border-dark px-8 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }}
                        className="flex items-center gap-3 group"
                    >
                        <div className="size-8 bg-charcoal dark:bg-primary rounded-lg flex items-center justify-center text-primary dark:text-charcoal shadow-sm group-hover:bg-primary group-hover:text-charcoal dark:group-hover:bg-charcoal dark:group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined font-bold text-xl">bolt</span>
                        </div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic">KIX</h2>
                    </a>
                </div>
                <div className="flex items-center gap-6">
                    <a
                        href="/orders"
                        onClick={(e) => { e.preventDefault(); navigateWithTransition('/orders'); }}
                        className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors italic"
                    >
                        My Orders
                    </a>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-40">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Secure Session
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">
                {/* Success Header */}
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <motion.div
                        className="inline-flex items-center justify-center size-20 bg-primary text-charcoal rounded-full mb-6 shadow-xl shadow-primary/20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                    >
                        <span className="material-symbols-outlined text-4xl font-black">check_circle</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">Payment Successful</h1>
                    <p className="text-charcoal/60 dark:text-white/60 font-bold uppercase tracking-widest text-sm">
                        Thank you for your purchase. Your sneakers are being prepped.
                    </p>
                </motion.div>

                {/* Order Info Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Order Number Card */}
                    <motion.div
                        className="bg-charcoal dark:bg-primary text-white dark:text-charcoal p-8 rounded-[2.5rem] flex flex-col justify-between"
                        variants={staggerItem}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 dark:text-charcoal/60">Order Number</span>
                                <h3 className="text-3xl font-black italic mt-1 uppercase">{orderNumber}</h3>
                            </div>
                            <motion.button
                                className="bg-white/10 dark:bg-charcoal/10 hover:bg-white/20 dark:hover:bg-charcoal/20 p-3 rounded-xl transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigator.clipboard.writeText(orderNumber)}
                            >
                                <span className="material-symbols-outlined text-xl">content_copy</span>
                            </motion.button>
                        </div>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary/20 dark:bg-charcoal/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary dark:text-charcoal">mail</span>
                            </div>
                            <p className="text-xs font-bold text-white/60 dark:text-charcoal/60">
                                Confirmation sent to <span className="text-white dark:text-charcoal">{email}</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Delivery Card */}
                    <motion.div
                        className="bg-primary dark:bg-charcoal text-charcoal dark:text-white p-8 rounded-[2.5rem] flex flex-col justify-between"
                        variants={staggerItem}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/40 dark:text-white/40">Estimated Delivery</span>
                            <h3 className="text-3xl font-black italic mt-1 uppercase">{deliveryDate}</h3>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-charcoal/10 dark:bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined">local_shipping</span>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest">Standard Express</p>
                            </div>
                            <motion.button
                                onClick={() => navigateWithTransition('/orders')}
                                className="bg-charcoal dark:bg-primary text-white dark:text-charcoal px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-charcoal/80 dark:hover:bg-white transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Track Order
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
                    {/* Review Section */}
                    <motion.section
                        className="space-y-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div
                            className="bg-white dark:bg-card-dark p-8 md:p-10 rounded-[2.5rem] border-2 border-gray-100 dark:border-border-dark shadow-sm"
                            variants={staggerItem}
                        >
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-4">
                                Review Your Purchase
                                <span className="h-[2px] w-12 bg-primary"></span>
                            </h2>

                            <div className="space-y-10">
                                {orderItems.map((item, index) => {
                                    const productId = item.product_id ? getProductId(item) : '';
                                    const alreadyReviewed = reviewedProductIds.has(productId);
                                    const itemStatus = perItemStatus[index];
                                    const productImage = item.product_image || null;

                                    return (
                                    <motion.div
                                        key={index}
                                        className={`flex flex-col md:flex-row gap-8 ${index < orderItems.length - 1 ? 'pb-10 border-b border-gray-100 dark:border-border-dark' : ''}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="w-32 h-32 bg-background-alt dark:bg-charcoal rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {productImage ? (
                                                <img src={productImage} alt={item.product_name || 'Product'} className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <span className="material-symbols-outlined text-5xl text-charcoal/20 dark:text-white/20">shoe</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="text-lg font-black uppercase italic tracking-tight">{item.product_name || 'Product'}</h4>
                                                    <p className="text-[10px] font-bold text-charcoal/40 dark:text-white/40 uppercase tracking-widest">
                                                        {item.size != null && `Size ${item.size}`}{item.size != null && item.color && ' • '}{item.color || ''}
                                                        {item.quantity > 1 && ` • Qty: ${item.quantity}`}
                                                    </p>
                                                </div>
                                                {(alreadyReviewed || itemStatus?.success) && (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full">
                                                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                        Da danh gia
                                                    </span>
                                                )}
                                                {itemStatus?.error && !itemStatus?.success && (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full">
                                                        <span className="material-symbols-outlined text-sm">error</span>
                                                        Loi
                                                    </span>
                                                )}
                                            </div>

                                            {alreadyReviewed && !itemStatus ? (
                                                <p className="text-xs text-charcoal/50 dark:text-white/50 italic">Ban da danh gia san pham nay roi.</p>
                                            ) : itemStatus?.success ? (
                                                <p className="text-xs text-green-500 italic">Cam on ban da danh gia!</p>
                                            ) : (
                                                <>
                                                    {/* Star Rating */}
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <motion.button
                                                                key={star}
                                                                onClick={() => handleRating(index, star)}
                                                                whileHover={{ scale: 1.2 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <span
                                                                    className={`material-symbols-outlined cursor-pointer transition-colors ${star <= (reviews[index]?.rating || 0)
                                                                        ? 'text-primary'
                                                                        : 'text-gray-200 dark:text-gray-600 hover:text-primary'
                                                                        }`}
                                                                    style={{ fontVariationSettings: star <= (reviews[index]?.rating || 0) ? "'FILL' 1" : "'FILL' 0" }}
                                                                >
                                                                    star
                                                                </span>
                                                            </motion.button>
                                                        ))}
                                                    </div>

                                                    <textarea
                                                        className="w-full bg-background-alt dark:bg-charcoal border-none rounded-xl p-4 text-xs font-bold placeholder:text-charcoal/20 dark:placeholder:text-white/20 focus:ring-2 focus:ring-primary"
                                                        placeholder="TELL US ABOUT THE FIT..."
                                                        rows={2}
                                                        value={reviews[index]?.comment || ''}
                                                        onChange={(e) => handleComment(index, e.target.value)}
                                                    />

                                                    {itemStatus?.error && (
                                                        <p className="text-red-400 text-[10px] font-bold">{itemStatus.error}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                    );
                                })}

                                {/* Experience Tags */}
                                <motion.div
                                    className="bg-charcoal dark:bg-primary p-8 rounded-3xl text-white dark:text-charcoal"
                                    variants={staggerItem}
                                >
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-4 italic">Overall Experience</h4>
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {EXPERIENCE_TAGS.map((tag) => (
                                            <motion.button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedTags.includes(tag)
                                                    ? 'bg-primary dark:bg-charcoal text-charcoal dark:text-primary border-primary dark:border-charcoal'
                                                    : 'border-white/20 dark:border-charcoal/20 hover:bg-primary hover:text-charcoal hover:border-primary dark:hover:bg-charcoal dark:hover:text-primary dark:hover:border-charcoal'
                                                    }`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {tag}
                                            </motion.button>
                                        ))}
                                    </div>
                                    {(() => {
                                        const allReviewed = orderItems.length > 0 && orderItems.every(item => {
                                            const pid = item.product_id ? getProductId(item) : '';
                                            return reviewedProductIds.has(pid);
                                        });
                                        const isDisabled = submittingReviews || reviewSuccess || allReviewed;

                                        return (
                                            <motion.button
                                                onClick={handleSubmitReviews}
                                                disabled={isDisabled}
                                                className="w-full py-4 bg-primary dark:bg-charcoal text-charcoal dark:text-primary text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white dark:hover:bg-white hover:text-charcoal transition-all shadow-xl shadow-primary/10 disabled:opacity-50"
                                                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                                                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                                            >
                                                {submittingReviews ? 'Dang gui...' : (reviewSuccess || allReviewed) ? 'Da gui thanh cong!' : 'Submit Reviews'}
                                            </motion.button>
                                        );
                                    })()}
                                    {reviewError && (
                                        <p className="text-red-400 text-[10px] font-bold mt-2 text-center">{reviewError}</p>
                                    )}
                                    {reviewSuccess && (
                                        <p className="text-green-400 text-[10px] font-bold mt-2 text-center uppercase tracking-widest">Cam on ban da danh gia!</p>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.section>

                    {/* Purchase Details Sidebar */}
                    <motion.aside
                        className="space-y-6"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-white dark:bg-card-dark border-2 border-gray-100 dark:border-border-dark p-8 rounded-[2.5rem] sticky top-24">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex justify-between items-center">
                                Purchase Details
                                <span className="text-[10px] bg-charcoal dark:bg-primary text-primary dark:text-charcoal px-2 py-0.5 rounded italic">{orderItems.length} Items</span>
                            </h3>

                            {/* Items list */}
                            <div className="space-y-3 mb-6">
                                {orderItems.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="font-bold truncate max-w-[200px]">
                                            {item.product_name || 'Product'} {item.quantity > 1 ? `x${item.quantity}` : ''}
                                        </span>
                                        <span className="font-black">{formatPrice(item.subtotal ?? item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-4 mb-8 border-t border-gray-100 dark:border-border-dark pt-6">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40">
                                    <span>Subtotal</span>
                                    <span className="text-charcoal dark:text-white">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40">
                                    <span>Shipping</span>
                                    <span className="text-primary italic">Free</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-charcoal/40 dark:text-white/40">
                                    <span>Tax (8%)</span>
                                    <span className="text-charcoal dark:text-white">{formatPrice(tax)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-green-500">
                                        <span>Discount {promoCode && `(${promoCode})`}</span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-gray-100 dark:border-border-dark flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Paid</span>
                                    <span className="text-3xl font-black italic tracking-tighter text-charcoal dark:text-white">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <motion.button
                                    onClick={handleDownloadInvoice}
                                    className="w-full py-4 border-2 border-charcoal dark:border-white text-charcoal dark:text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Download Invoice
                                </motion.button>
                                <motion.button
                                    onClick={() => navigateWithTransition('/sneakers')}
                                    className="w-full py-4 bg-gray-100 dark:bg-charcoal text-charcoal dark:text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 dark:hover:bg-primary dark:hover:text-charcoal transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Return to Shop
                                </motion.button>
                            </div>
                        </div>

                        {/* Share Section */}
                        <div className="bg-background-alt dark:bg-card-dark p-6 rounded-[2rem] border border-gray-100 dark:border-border-dark text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-charcoal/40 dark:text-white/40">Share your latest pick-up</p>
                            <div className="flex justify-center gap-4">
                                <motion.button
                                    className="size-10 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border border-gray-100 dark:border-border-dark hover:text-primary transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="material-symbols-outlined text-lg">share</span>
                                </motion.button>
                                <motion.button
                                    className="size-10 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border border-gray-100 dark:border-border-dark hover:text-primary transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.aside>
                </div>

                <Footer />
            </main>

            {/* Floating AI Button */}
            <motion.div
                className="fixed bottom-8 right-8 z-[50]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
            >
                <motion.button
                    className="size-16 bg-charcoal dark:bg-primary text-primary dark:text-charcoal rounded-full shadow-2xl flex items-center justify-center border-4 border-primary dark:border-charcoal group relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="material-symbols-outlined text-3xl font-bold">auto_awesome</span>
                    <div className="absolute right-full mr-4 bg-charcoal text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                        Need styling tips?
                    </div>
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default PaymentResultsPage;
