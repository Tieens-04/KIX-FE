import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { navigateWithTransition } from '../components/PageTransition';

const SNEAKERS = [
    { id: 1, name: 'VaporMax Flyknit', price: 189, qty: 1, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo' },
    { id: 2, name: 'Dunk Low Pro', price: 120, qty: 2, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20' },
    { id: 3, name: 'Air Jordan 1 Low', price: 110, qty: 1, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo' },
    { id: 4, name: 'Air Max 270', price: 144, qty: 1, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9t3YIuCIONp__ieTj-01FjNI4qKViScLPpye53fZMZ8z2gAnpA3WL2ug7H1JeHuUvz1V-zz2oECkFjwU_ztXWpJuezR1wS-8PjdpnmSCqPUqdrrISBqv3WiWgHNNyQqMm_tr-OROEVU5xiQmsP7sJRwlXuVUuWlPbozk5w6JTi9kGZV4A-QrDOou1PwpmBd31giLRbn9DmJdjdnTxtmcwmoh7iKYQMqrZCWAAp87PA9b9tXEdWVntZ6aJdS5qGzxmh1xY_A1HK9w' },
];

const StudioPage: React.FC = () => {
    const [selectedSneaker, setSelectedSneaker] = useState(SNEAKERS[2]);
    const [droppedItems, setDroppedItems] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const totalPrice = SNEAKERS.reduce((sum, item) => sum + item.price * item.qty, 0);

    const handleGenerateOutfit = async () => {
        setIsGenerating(true);

        // Prompt for image generation based on selected items
        const prompt = `A professional studio product photography of a complete streetwear outfit styled on a model or mannequin. 
        The outfit includes: ${selectedSneaker.name} sneakers in red/crimson colorway, 
        light wash blue denim jeans, 
        and a neutral grey oversized hoodie. 
        Clean white background, studio lighting, fashion catalog style, high quality, detailed product shot.`;

        try {
            // Simulate API call - replace with actual implementation
            setTimeout(() => {
                setGeneratedImage('https://i.pinimg.com/736x/fe/93/09/fe9309444e607ef7c9f2203b88ebeb07.jpg');
                setIsGenerating(false);
            }, 2000);
        } catch (error) {
            console.error('Generation failed:', error);
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border-light px-8 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="size-8 bg-primary rounded-lg flex items-center justify-center text-charcoal shadow-sm"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="material-symbols-outlined font-bold text-xl">bolt</span>
                    </motion.div>
                    <h2 className="text-xl font-black tracking-tighter uppercase italic"><a href="/">KIX Studio</a></h2>
                </div>
                <nav className="flex gap-8">
                    <a onClick={(e) => { e.preventDefault(); navigateWithTransition('/sneakers'); }} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">Shop</a>
                    <a className="text-[10px] font-black uppercase tracking-widest text-primary">Studio</a>
                    <a onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">Drops</a>
                </nav>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigateWithTransition('/cart')} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined">shopping_bag</span>
                        <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-[8px] font-black flex items-center justify-center border-2 border-white rounded-full">
                            {SNEAKERS.reduce((sum, item) => sum + item.qty, 0)}
                        </span>
                    </button>
                    <button
                        onClick={() => navigateWithTransition('/login')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">account_circle</span>
                    </button>
                    <motion.button
                        onClick={() => navigateWithTransition('/login')}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-full transition-colors text-red-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                    </motion.button>
                </div>
            </header>

            <main className="pt-16 flex h-screen max-h-screen">
                {/* Left Sidebar - Cart */}
                <aside className="w-80 border-r border-border-light bg-background-alt overflow-y-auto flex-shrink-0 flex flex-col">
                    {/* My Picks Grid */}
                    <div className="p-6 border-b border-border-light bg-white sticky top-0 z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">My Picks</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-charcoal text-white rounded">
                                {SNEAKERS.reduce((sum, item) => sum + item.qty, 0)} Items
                            </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {SNEAKERS.map((sneaker, index) => (
                                <motion.div
                                    key={sneaker.id}
                                    onClick={() => setSelectedSneaker(sneaker)}
                                    className={`size-14 bg-white rounded-xl border p-1 cursor-pointer hover:border-primary transition-all group relative ${selectedSneaker.id === sneaker.id ? 'border-primary ring-2 ring-primary/20' : 'border-border-light'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <img
                                        alt={sneaker.name}
                                        className="w-full h-full object-contain -rotate-12 group-hover:rotate-0 transition-transform"
                                        src={sneaker.image}
                                    />
                                    {selectedSneaker.id === sneaker.id && (
                                        <div className="absolute -top-1 -right-1 size-3 bg-primary rounded-full ring-2 ring-white"></div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 p-4 space-y-3">
                        {SNEAKERS.map((item) => (
                            <motion.div
                                key={item.id}
                                className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${selectedSneaker.id === item.id
                                    ? 'bg-white border-primary'
                                    : 'bg-white border-border-light opacity-60 hover:opacity-100'
                                    }`}
                                whileHover={{ x: 4 }}
                            >
                                <div className="size-12 bg-gray-50 rounded-lg flex-shrink-0">
                                    <img alt={item.name} className="w-full h-full object-contain -rotate-12" src={item.image} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[10px] font-black uppercase truncate">{item.name}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-gray-400">Qty: {item.qty}</span>
                                        <span className="text-[10px] font-black italic">${item.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Cart Total */}
                    <div className="p-6 bg-charcoal text-white rounded-t-3xl">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Estimated Total</span>
                            <span className="text-2xl font-black italic text-primary leading-none">${totalPrice.toFixed(2)}</span>
                        </div>
                        <motion.button
                            onClick={() => navigateWithTransition('/cart')}
                            className="w-full py-4 bg-primary text-charcoal text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Checkout Now
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </motion.button>
                    </div>
                </aside>

                {/* Right Canvas - Styling Board */}
                <section className="flex-1 bg-white relative flex flex-col" style={{
                    backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}>
                    {/* Title */}
                    <div className="absolute top-8 left-10 z-20">
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                            Studio<br />
                            <span className="text-primary" style={{ WebkitTextStroke: '1px #25f425', color: 'white' }}>Creator</span>
                        </h1>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/40">
                            AI-Powered Outfit Styling
                        </p>
                    </div>

                    {/* Top Actions */}
                    <div className="absolute top-8 right-10 z-20 flex gap-4">
                        <motion.button
                            className="size-12 bg-white border border-border-light rounded-2xl flex items-center justify-center shadow-lg hover:border-primary transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setGeneratedImage(null);
                                setSelectedSneaker(SNEAKERS[2]);
                            }}
                        >
                            <span className="material-symbols-outlined">restart_alt</span>
                        </motion.button>
                        <motion.button
                            className="size-12 bg-white border border-border-light rounded-2xl flex items-center justify-center shadow-lg hover:border-primary transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="material-symbols-outlined">share</span>
                        </motion.button>
                        <motion.button
                            onClick={handleGenerateOutfit}
                            disabled={isGenerating}
                            className="px-6 h-12 bg-charcoal text-white rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all disabled:opacity-50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="material-symbols-outlined text-primary">
                                {isGenerating ? 'hourglass_empty' : 'auto_awesome'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isGenerating ? 'Generating...' : 'AI Generate Outfit'}
                            </span>
                        </motion.button>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        {/* Background Blur Effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-[600px] bg-primary/5 rounded-full blur-3xl"></div>
                        </div>

                        {generatedImage ? (
                            /* Generated Image Display */
                            <motion.div
                                className="relative z-10"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <img
                                    src={generatedImage}
                                    alt="Generated Outfit"
                                    className="max-w-2xl max-h-[600px] rounded-3xl shadow-2xl border-4 border-charcoal"
                                />
                            </motion.div>
                        ) : (
                            /* Styling Placeholder */
                            <div className="relative w-full max-w-4xl h-full flex items-center justify-center p-12">
                                <div className="relative flex flex-col items-center gap-8" style={{ perspective: '1000px' }}>
                                    {/* Top Drop Zone - Clothing */}
                                    <motion.div
                                        className="w-64 h-64 border-4 border-dashed border-charcoal/10 rounded-[3rem] flex items-center justify-center group hover:border-primary/50 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="text-center opacity-20 group-hover:opacity-40">
                                            <span className="material-symbols-outlined text-4xl mb-2">checkroom</span>
                                            <p className="text-[9px] font-black uppercase tracking-widest">Drop Hoodie/Tee</p>
                                        </div>
                                    </motion.div>

                                    {/* Middle - Pants Visualization */}
                                    <div className="relative -mt-20 z-10">
                                        <div className="w-[300px] h-[450px] bg-gradient-to-b from-blue-400/20 to-blue-600/10 rounded-[2rem] border-2 border-blue-500/20 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col items-center p-6">
                                            <div className="w-full h-full flex items-center justify-center relative">
                                                <span className="material-symbols-outlined text-8xl text-blue-500/20">apparel</span>
                                                <div className="absolute inset-x-8 bottom-0 h-full border-x-8 border-blue-500/30 rounded-t-full"></div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                    <p className="text-[10px] font-black uppercase text-blue-600/40 tracking-[0.4em]" style={{ transform: 'rotate(90deg)' }}>
                                                        Retro Blue Denim
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sneaker */}
                                        <motion.div
                                            className="absolute -bottom-12 -right-20 w-[450px] group transition-all duration-500"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="relative">
                                                <img
                                                    alt={selectedSneaker.name}
                                                    className="w-full h-auto -rotate-12 transition-transform duration-700 group-hover:-rotate-6"
                                                    style={{ filter: 'drop-shadow(0 35px 35px rgba(0,0,0,0.3))' }}
                                                    src={selectedSneaker.image}
                                                />
                                                <motion.div
                                                    className="absolute top-1/2 right-0 bg-white p-4 rounded-2xl shadow-2xl border border-primary/20 max-w-[140px]"
                                                    initial={{ opacity: 0, x: 40 }}
                                                    whileHover={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                                                        <span className="text-[8px] font-black uppercase">Vibe Match 98%</span>
                                                    </div>
                                                    <h5 className="text-[10px] font-black uppercase leading-tight">{selectedSneaker.name}</h5>
                                                    <p className="text-[8px] font-bold text-gray-400 mt-1">
                                                        Perfect with light wash denim &amp; neutral layers.
                                                    </p>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-10 inset-x-10 flex justify-between items-end z-20">
                        {/* AI Stylist Opinion */}
                        <motion.div
                            className="bg-charcoal text-white p-6 rounded-3xl max-w-xs shadow-2xl border border-white/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">psychology</span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">AI Stylist Opinion</p>
                                    <p className="text-[9px] font-medium text-white/60 leading-relaxed italic">
                                        "The {selectedSneaker.name} provides a sharp contrast against vintage washed blue denim.
                                        Consider a neutral oversized grey hoodie to balance the silhouette."
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Next Pairing */}
                        <div className="flex gap-2">
                            <div className="bg-white border border-border-light p-3 rounded-2xl flex items-center gap-4 shadow-xl">
                                <div className="size-10 bg-gray-100 rounded-xl overflow-hidden p-1">
                                    <img alt="next" className="w-full h-full object-contain" src={SNEAKERS[0].image} />
                                </div>
                                <div className="pr-2">
                                    <p className="text-[8px] font-black uppercase text-gray-400">Next pairing</p>
                                    <p className="text-[10px] font-black uppercase">{SNEAKERS[0].name}</p>
                                </div>
                                <motion.button
                                    className="size-8 bg-primary rounded-lg flex items-center justify-center"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedSneaker(SNEAKERS[0])}
                                >
                                    <span className="material-symbols-outlined text-sm font-bold">swap_horiz</span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Floating AI Button */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <motion.button
                    className="size-16 bg-charcoal text-primary rounded-full shadow-2xl flex items-center justify-center border-4 border-primary group relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleGenerateOutfit}
                >
                    <span className="material-symbols-outlined text-3xl font-bold">auto_awesome</span>
                    <div className="absolute right-full mr-4 bg-charcoal text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                        AI Generate Outfit
                    </div>
                </motion.button>
            </div>
        </div>
    );
};

export default StudioPage;
