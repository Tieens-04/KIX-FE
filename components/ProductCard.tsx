
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className={`group bg-white dark:bg-card-dark rounded-3xl overflow-hidden border transition-all duration-500 p-3
      ${product.isFeatured ? 'border-2 border-primary scale-105 shadow-[0_0_30px_rgba(37,244,37,0.15)]' : 'border-border-light dark:border-border-dark hover:translate-y-[-8px] hover:shadow-2xl'}
      ${product.isSoldOut ? 'opacity-60' : ''}
    `}>
      <div className={`aspect-[4/5] rounded-2xl overflow-hidden bg-background-alt dark:bg-charcoal relative mb-4 ${product.isSoldOut ? 'grayscale' : ''}`}>
        <img
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={product.imageUrl}
        />

        {product.isHot && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-sm uppercase italic skew-x-[-5deg]">
            Sale -20%
          </div>
        )}

        {product.isSoldOut && (
          <div className="absolute inset-0 bg-charcoal/50 flex items-center justify-center">
            <p className="font-black text-white text-[10px] uppercase tracking-widest border-2 border-white px-4 py-2 rounded-full">
              Sold Out
            </p>
          </div>
        )}

        {product.isFeatured && !product.isSoldOut && (
          <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="bg-white text-charcoal font-black py-3 px-8 rounded-full text-xs uppercase tracking-widest shadow-xl">
              Quick View
            </button>
          </div>
        )}

        {!product.isSoldOut && (
          <button className="absolute top-3 right-3 size-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-xl text-charcoal hover:text-red-500 transition-colors">favorite</span>
          </button>
        )}
      </div>

      <div className="px-3 pb-3">
        <h3 className="font-black text-xl mb-1 leading-tight uppercase italic">{product.name}</h3>
        <p className="text-xs font-bold opacity-40 mb-4 uppercase tracking-widest">{product.category} • {product.colorway}</p>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="font-black text-primary text-2xl">${product.price}</p>
            {product.oldPrice && <p className="text-[10px] opacity-30 line-through">${product.oldPrice}</p>}
          </div>

          {product.isSoldOut ? (
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest border border-primary/30 px-3 py-1 rounded-full">Waitlist</span>
          ) : (
            <button
              onClick={() => onAddToCart?.(product)}
              className={`p-3 rounded-2xl transition-all ${product.isFeatured ? 'bg-primary text-charcoal shadow-lg hover:bg-charcoal hover:text-white' : 'bg-gray-100 dark:bg-border-dark hover:bg-primary hover:text-charcoal'}`}
            >
              <span className="material-symbols-outlined font-black">
                {product.isFeatured ? 'check' : 'add'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
