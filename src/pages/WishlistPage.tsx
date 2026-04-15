import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { MOCK_PRODUCTS } from '@/mockData';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(MOCK_PRODUCTS.slice(1, 3));

  const removeFromWishlist = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
    toast.error('Removed from wishlist');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
            <Heart className="h-10 w-10" />
          </div>
        </div>
        <h2 className="mb-4 text-3xl font-light">Your wishlist is empty</h2>
        <p className="mb-8 text-brand-dark/60">Save your favorite pieces to view them later.</p>
        <Link to="/products" className={cn(buttonVariants(), "bg-brand-gold text-white")}>
          Explore Jewelry
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-12">
      <h1 className="mb-12 font-serif text-4xl font-light">My Wishlist</h1>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlistItems.map((product) => (
          <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="relative aspect-square overflow-hidden">
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-3 rounded-full bg-white/80 backdrop-blur-sm hover:bg-red-500 hover:text-white"
                onClick={() => removeFromWishlist(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <h3 className="mb-2 font-serif text-lg font-medium">{product.name}</h3>
              <p className="mb-4 text-xl font-semibold">${product.price.toLocaleString()}</p>
              <div className="flex gap-2">
                <Button className="flex-1 bg-brand-dark text-white hover:bg-brand-dark/90">
                  <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Link to={`/products/${product.id}`} className={cn(buttonVariants({ variant: "outline", size: "icon" }))}>
                  <span className="sr-only">View</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
