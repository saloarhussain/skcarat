import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative m-[5px] flex flex-col overflow-hidden rounded-lg border border-brand-dark/5 bg-white transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
    >
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-[#F9F9F9]">
        <img
          src={product.images?.[0] || 'https://picsum.photos/seed/jewelry/800/800'}
          alt={product.name}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Top Left Label (Bestseller/New Arrival) */}
        {(product.label || product.isFeatured || product.isNew) && (
          <div className="absolute left-0 top-0 z-10">
            <div className="relative bg-[#E98B8B] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm after:absolute after:left-0 after:top-full after:border-[6px] after:border-transparent after:border-l-[#E98B8B] after:border-t-[#E98B8B]">
              {product.label || (product.isFeatured ? 'Bestseller' : 'New')}
            </div>
          </div>
        )}

        {/* Top Right Wishlist */}
        <button 
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-dark/30 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:text-[#E98B8B] hover:shadow-md"
          onClick={(e) => {
            e.preventDefault();
            // Wishlist logic
          }}
        >
          <Heart className="h-5 w-5" />
        </button>

        {/* Rating Overlay (Bottom Left of Image) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-brand-dark shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-0.5">
            {product.rating} <Star className="h-2.5 w-2.5 fill-brand-gold text-brand-gold" />
          </span>
          <span className="ml-1 border-l border-brand-dark/10 pl-1 text-brand-dark/40">
            {product.reviewsCount || 0}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-baseline gap-2">
          <span className="text-sm font-bold text-brand-dark">
            ₹{product.price.toLocaleString()}
          </span>
          <span className="text-[11px] text-brand-dark/30 line-through">
            ₹{(product.price * 1.5).toLocaleString()}
          </span>
        </div>
        
        <Link to={`/products/${product.id}`} className="mb-2 block">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-brand-dark/80 transition-colors hover:text-brand-gold">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <span className="inline-block rounded-sm bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600">
            Price Drop!
          </span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="border-t border-brand-dark/5 p-3">
        <Button 
          className="h-11 w-full rounded-lg bg-[#FCE4EC] text-[11px] font-bold uppercase tracking-widest text-brand-dark transition-all hover:bg-[#F8BBD0] active:scale-[0.98]"
          onClick={(e) => {
            e.preventDefault();
            // Add to cart logic
          }}
        >
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}
