import React from 'react';
import { navigateWithTransition } from './PageTransition';

interface Product {
    id: number;
    name: string;
    category: string;
    color: string;
    price: number;
    originalPrice?: number;
    image: string;
    badge?: string;
    badgeColor?: string;
    featured?: boolean;
    soldOut?: boolean;
}

interface ProductGridProps {
    products: Product[];
    onAddToCart?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map((product) => {
                if (product.featured) {
                    return (
                        <div
                            key={product.id}
                            className="group bg-primary rounded-[3.5rem] overflow-hidden p-6 transition-all duration-500 hover:-rotate-1 shadow-[24px_24px_60px_-15px_rgba(37,244,37,0.3)] cursor-pointer"
                            onClick={() => navigateWithTransition(`/sneakers/${product.id}`)}
                        >
                            <div className="aspect-square rounded-[3rem] overflow-hidden bg-white relative mb-8 border-4 border-white shadow-inner">
                                <img
                                    alt={product.name}
                                    className="w-full h-full object-contain p-12 group-hover:scale-110 transition-transform duration-700 rotate-[-10deg]"
                                    src={product.image}
                                />
                                <div className="absolute inset-0 bg-charcoal/0 flex items-center justify-center group-hover:bg-charcoal/5 transition-all">
                                    <button onClick={(e) => e.stopPropagation()} className="bg-charcoal text-white font-black py-4 px-10 rounded-full text-xs uppercase tracking-widest shadow-2xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all">
                                        Quick Purchase
                                    </button>
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-black text-3xl text-charcoal uppercase italic tracking-tighter">{product.name}</h3>
                                        <p className="text-sm font-black text-charcoal/60 uppercase tracking-widest">{product.category} • {product.color}</p>
                                    </div>
                                    <div className="size-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <span className="material-symbols-outlined text-primary font-black">verified</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="font-black text-charcoal text-5xl">${product.price}</p>
                                    <div className="flex -space-x-4">
                                        <div className="size-10 rounded-full border-4 border-primary bg-charcoal shadow-lg"></div>
                                        <div className="size-10 rounded-full border-4 border-primary bg-white shadow-lg"></div>
                                        <div className="size-10 rounded-full border-4 border-primary bg-red-500 shadow-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                if (product.soldOut) {
                    return (
                        <div
                            key={product.id}
                            className="group bg-white dark:bg-card-dark rounded-[2.5rem] border-2 border-gray-100 dark:border-border-dark p-5 hover:border-primary transition-all shadow-sm opacity-60"
                        >
                            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-charcoal relative mb-6"></div>
                            <div className="h-6 w-3/4 bg-gray-100 dark:bg-charcoal rounded mb-4"></div>
                            <div className="h-10 w-1/3 bg-gray-100 dark:bg-charcoal rounded"></div>
                        </div>
                    );
                }

                return (
                    <div
                        key={product.id}
                        className="group bg-white dark:bg-card-dark rounded-[2.5rem] overflow-hidden border-2 border-gray-100 dark:border-border-dark p-4 shadow-lg hover:border-primary transition-all duration-500 cursor-pointer"
                        onClick={() => navigateWithTransition(`/sneakers/${product.id}`)}
                    >
                        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-background-alt dark:bg-charcoal relative mb-8">
                            <img
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                src={product.image}
                            />
                            {product.badge && (
                                <div className="absolute top-6 left-6">
                                    <span className={`px-4 py-1 ${product.badgeColor || 'bg-charcoal'} text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}>
                                        {product.badge}
                                    </span>
                                </div>
                            )}
                            <button onClick={(e) => e.stopPropagation()} className="absolute bottom-6 right-6 size-12 rounded-full bg-white shadow-xl flex items-center justify-center translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="material-symbols-outlined text-charcoal hover:text-red-500 transition-colors">favorite</span>
                            </button>
                        </div>
                        <div className="px-4 pb-4">
                            <h3 className="font-black text-3xl mb-2 leading-tight uppercase italic tracking-tighter">{product.name}</h3>
                            <p className="text-xs font-bold opacity-40 mb-8 uppercase tracking-[0.2em]">{product.category} • {product.color}</p>
                            <div className="flex justify-between items-center border-t border-gray-100 dark:border-border-dark pt-6">
                                <div className="flex items-center gap-3">
                                    <p className={`font-black text-4xl ${product.originalPrice ? 'text-primary' : ''}`}>${product.price.toFixed(2)}</p>
                                    {product.originalPrice && (
                                        <p className="text-xs font-bold opacity-30 line-through">${product.originalPrice}</p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
                                    className="bg-primary size-14 rounded-2xl text-charcoal shadow-lg hover:bg-charcoal hover:text-white transition-all group/btn flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined font-black text-2xl group-hover/btn:rotate-90 transition-transform">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Newsletter Card */}
            <div className="group bg-charcoal dark:bg-primary rounded-[2.5rem] p-8 text-white dark:text-charcoal relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-4 -top-4 size-32 bg-primary/20 dark:bg-charcoal/20 rounded-full blur-3xl"></div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary dark:text-charcoal mb-4">Newsletter</p>
                    <h4 className="text-3xl font-black uppercase italic leading-tight mb-8">Get 15% off your first order</h4>
                </div>
                <div className="relative">
                    <input
                        className="w-full bg-white/10 dark:bg-charcoal/10 border-none rounded-full py-4 px-6 text-sm placeholder:text-white/30 dark:placeholder:text-charcoal/30 focus:ring-2 focus:ring-primary dark:focus:ring-charcoal transition-all"
                        placeholder="Enter Email"
                        type="text"
                    />
                    <button className="absolute right-2 top-2 size-10 bg-primary dark:bg-charcoal rounded-full flex items-center justify-center text-charcoal dark:text-primary">
                        <span className="material-symbols-outlined text-sm font-black">east</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductGrid;
