import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Color } from '../types';

interface SidebarProps {
    selectedSize: string;
    setSelectedSize: (size: string) => void;
    selectedColor: string;
    setSelectedColor: (color: string) => void;
    colors: Color[];
    sizes: number[];
    priceRange: { min: number; max: number };
    selectedPriceRange: { min: number; max: number };
    setSelectedPriceRange: (range: { min: number; max: number }) => void;
    onReset: () => void;
}

// Fake AI chat data
const FAKE_AI_RESPONSES = [
    {
        type: 'ai',
        message: "Hi! I'm your AI Stylist. What kind of sneakers are you looking for today?",
        suggestions: ['Sporty Performance', 'Classic Minimalist', 'Street Style'],
    },
    {
        type: 'user',
        message: "I want something sporty with a pop of color",
    },
    {
        type: 'ai',
        message: "Great choice! Based on your preference, I recommend the VaporMax Flyknit in Volt Green - it's perfect for sporty daily wear with that pop of color you're looking for!",
        product: {
            name: 'VaporMax Flyknit',
            price: '4,725,000 VND',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
        },
    },
];

type SidebarMode = 'filter' | 'ai';

// --- Dual Range Slider Component ---
interface DualRangeSliderProps {
    min: number;
    max: number;
    valueMin: number;
    valueMax: number;
    onChange: (min: number, max: number) => void;
    onChangeEnd: (min: number, max: number) => void;
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({ min, max, valueMin, valueMax, onChange, onChangeEnd }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef<'min' | 'max' | null>(null);

    const getPercent = (value: number) => {
        if (max === min) return 0;
        return ((value - min) / (max - min)) * 100;
    };

    const getValueFromPosition = useCallback((clientX: number): number => {
        if (!trackRef.current) return min;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const raw = min + percent * (max - min);
        // Round to nearest integer
        return Math.round(raw);
    }, [min, max]);

    const handlePointerDown = useCallback((thumb: 'min' | 'max') => (e: React.PointerEvent) => {
        e.preventDefault();
        draggingRef.current = thumb;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!draggingRef.current) return;
        const val = getValueFromPosition(e.clientX);
        if (draggingRef.current === 'min') {
            const newMin = Math.min(val, valueMax - 1);
            onChange(Math.max(min, newMin), valueMax);
        } else {
            const newMax = Math.max(val, valueMin + 1);
            onChange(valueMin, Math.min(max, newMax));
        }
    }, [getValueFromPosition, valueMin, valueMax, min, max, onChange]);

    const handlePointerUp = useCallback(() => {
        if (draggingRef.current) {
            draggingRef.current = null;
            onChangeEnd(valueMin, valueMax);
        }
    }, [valueMin, valueMax, onChangeEnd]);

    const leftPercent = getPercent(valueMin);
    const rightPercent = 100 - getPercent(valueMax);

    return (
        <div
            ref={trackRef}
            className="relative h-1.5 bg-gray-100 dark:bg-charcoal rounded-full mb-6 select-none touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {/* Active range bar */}
            <div
                className="absolute h-full bg-primary rounded-full"
                style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
            ></div>
            {/* Min thumb */}
            <div
                className="absolute top-1/2 -translate-y-1/2 size-5 bg-white border-[3px] border-charcoal rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform z-10"
                style={{ left: `${leftPercent}%`, transform: `translate(-50%, -50%)` }}
                onPointerDown={handlePointerDown('min')}
            ></div>
            {/* Max thumb */}
            <div
                className="absolute top-1/2 -translate-y-1/2 size-5 bg-white border-[3px] border-charcoal rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform z-10"
                style={{ left: `${100 - rightPercent}%`, transform: `translate(-50%, -50%)` }}
                onPointerDown={handlePointerDown('max')}
            ></div>
        </div>
    );
};
// --- End Dual Range Slider ---

const Sidebar: React.FC<SidebarProps> = ({
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    colors,
    sizes,
    priceRange,
    selectedPriceRange,
    setSelectedPriceRange,
    onReset,
}) => {
    const [mode, setMode] = useState<SidebarMode>('filter');
    const [chatInput, setChatInput] = useState('');
    // Local price state for smooth dragging (only triggers API on release)
    const [localPrice, setLocalPrice] = useState(selectedPriceRange);

    // Sync local price when props change (e.g. on reset)
    useEffect(() => {
        setLocalPrice(selectedPriceRange);
    }, [selectedPriceRange]);

    const formatPrice = (val: number) => {
        return new Intl.NumberFormat('vi-VN').format(val) + ' VND';
    };

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-card-dark border-r border-border-light dark:border-border-dark overflow-y-auto hidden lg:flex flex-col p-6">
            {/* Mode Toggle */}
            <div className="mb-6">
                <div className="flex bg-gray-100 dark:bg-charcoal rounded-xl p-1">
                    <button
                        onClick={() => setMode('filter')}
                        className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'filter'
                                ? 'bg-white dark:bg-primary text-charcoal shadow-sm'
                                : 'text-charcoal/50 dark:text-white/50 hover:text-charcoal dark:hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">tune</span>
                        Filter
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'ai'
                                ? 'bg-white dark:bg-primary text-charcoal shadow-sm'
                                : 'text-charcoal/50 dark:text-white/50 hover:text-charcoal dark:hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">neurology</span>
                        AI Chat
                    </button>
                </div>
            </div>

            {mode === 'filter' ? (
                /* Filter Mode */
                <div className="space-y-8 flex-1">
                    {/* Price Range */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 dark:text-white/40">Price Range</h4>
                            <span className="text-xs font-black italic">{formatPrice(localPrice.min)} - {formatPrice(localPrice.max)}</span>
                        </div>
                        <DualRangeSlider
                            min={priceRange.min}
                            max={priceRange.max}
                            valueMin={localPrice.min}
                            valueMax={localPrice.max}
                            onChange={(newMin, newMax) => setLocalPrice({ min: newMin, max: newMax })}
                            onChangeEnd={(newMin, newMax) => setSelectedPriceRange({ min: newMin, max: newMax })}
                        />
                    </div>

                    {/* Vibe / Colors */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 dark:text-white/40">Vibe / Colors</h4>
                            {selectedColor && (
                                <button
                                    onClick={() => setSelectedColor('')}
                                    className="text-[9px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        {colors.length > 0 ? (
                            <div className="grid grid-cols-4 gap-3">
                                {colors.map((color) => (
                                    <button
                                        key={color.id || color._id}
                                        onClick={() => setSelectedColor(selectedColor === color.name ? '' : color.name)}
                                        title={color.name}
                                        className={`size-10 rounded-xl border-2 ${selectedColor === color.name
                                                ? 'border-primary shadow-lg ring-2 ring-primary ring-offset-2'
                                                : 'border-transparent hover:border-primary'
                                            } transition-all`}
                                        style={{ backgroundColor: color.code }}
                                    ></button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-charcoal/30 dark:text-white/30 italic">Loading colors...</p>
                        )}
                    </div>

                    {/* US Sizes */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 dark:text-white/40">US Sizes</h4>
                            {selectedSize && (
                                <button
                                    onClick={() => setSelectedSize('')}
                                    className="text-[9px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        {sizes.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(selectedSize === String(size) ? '' : String(size))}
                                        className={`p-2 border text-[10px] font-black transition-all ${selectedSize === String(size)
                                                ? 'border-charcoal bg-charcoal text-white'
                                                : 'border-gray-100 dark:border-border-dark hover:bg-charcoal hover:text-white'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-charcoal/30 dark:text-white/30 italic">Loading sizes...</p>
                        )}
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className="w-full py-4 bg-charcoal dark:bg-primary text-white dark:text-charcoal text-xs font-black uppercase tracking-[0.3em] rounded-xl hover:bg-primary hover:text-charcoal dark:hover:bg-white transition-all"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                /* AI Chat Mode */
                <div className="flex flex-col flex-1">
                    {/* AI Status */}
                    <div className="mb-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-charcoal rounded-xl border border-primary/20">
                            <div className="size-10 bg-charcoal dark:bg-primary rounded-lg flex items-center justify-center text-primary dark:text-charcoal relative">
                                <span className="material-symbols-outlined text-xl">neurology</span>
                                <div className="absolute -top-1 -right-1 size-2.5 bg-primary dark:bg-charcoal rounded-full border-2 border-white dark:border-primary animate-pulse"></div>
                            </div>
                            <div>
                                <p className="font-black text-[10px] uppercase tracking-widest">Kit-01 AI</p>
                                <p className="text-[9px] font-bold text-charcoal/40 dark:text-white/40">Personal Stylist • Online</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {FAKE_AI_RESPONSES.map((msg, index) => (
                            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.type === 'ai' ? (
                                    <div className="max-w-full">
                                        <div className="bg-gray-100 dark:bg-charcoal p-3 rounded-xl rounded-tl-none">
                                            <p className="text-[11px] font-medium leading-relaxed">{msg.message}</p>
                                        </div>
                                        {msg.suggestions && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {msg.suggestions.map((sug, i) => (
                                                    <button key={i} className="px-2 py-1 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase hover:bg-primary hover:text-charcoal transition-all">
                                                        {sug}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {msg.product && (
                                            <div className="mt-2 bg-white dark:bg-card-dark rounded-xl p-2 border border-border-light dark:border-border-dark">
                                                <div className="flex gap-2">
                                                    <img src={msg.product.image} alt={msg.product.name} className="w-12 h-12 rounded-lg object-cover" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase">{msg.product.name}</p>
                                                        <p className="text-[10px] font-bold text-primary">{msg.product.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-charcoal dark:bg-primary text-white dark:text-charcoal p-3 rounded-xl rounded-tr-none max-w-[85%]">
                                        <p className="text-[11px] font-medium">{msg.message}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="mt-auto">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-charcoal rounded-xl p-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask AI stylist..."
                                className="flex-1 bg-transparent border-none text-[11px] font-medium placeholder:text-charcoal/30 dark:placeholder:text-white/30 focus:ring-0"
                            />
                            <button className="size-8 bg-primary rounded-lg flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-all">
                                <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                        </div>
                        <a
                            href="/chat"
                            className="mt-3 w-full py-3 border-2 border-charcoal dark:border-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            Full Chat Experience
                        </a>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
