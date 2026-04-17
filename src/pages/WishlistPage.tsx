import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/FirebaseProvider';
import { db } from '@/firebase';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import { Product } from '@/types';
import { useCart } from '@/providers/CartProvider';

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const wishlistIds = userData.wishlist || [];
        
        if (wishlistIds.length > 0) {
          // Fetch products in wishlist
          const q = query(collection(db, 'products'), where('__name__', 'in', wishlistIds.slice(0, 10)));
          const querySnapshot = await getDocs(q);
          const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setWishlistItems(products);
        } else {
          setWishlistItems([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeFromWishlist = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        wishlist: arrayRemove(id)
      });
      toast.error('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

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
          <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-brand-dark/5">
            <div className="relative aspect-square overflow-hidden bg-[#F9F9F9]">
              <Link to={`/products/${product.id}`}>
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105" referrerPolicy="no-referrer" />
              </Link>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-3 rounded-full bg-white/80 backdrop-blur-sm hover:bg-red-500 hover:text-white"
                onClick={() => removeFromWishlist(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <Link to={`/products/${product.id}`}>
                <h3 className="mb-2 font-medium line-clamp-1">{product.name}</h3>
              </Link>
              <p className="mb-4 text-xl font-bold">₹{product.price.toLocaleString()}</p>
              <div className="flex gap-2 mt-auto">
                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-brand-dark text-white hover:bg-brand-dark/90 text-xs font-bold uppercase tracking-widest"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Link to={`/products/${product.id}`} className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-lg")}>
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
