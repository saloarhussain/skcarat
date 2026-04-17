import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Reel, Product } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCart } from '@/providers/CartProvider';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function ReelsSection() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const unsubscribeReels = onSnapshot(
      query(collection(db, 'reels'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const reelsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Reel[];
        setReels(reelsData);
        setLoading(false);
      }
    );

    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const prods: Record<string, Product> = {};
        snapshot.docs.forEach(doc => {
          prods[doc.id] = { id: doc.id, ...doc.data() } as Product;
        });
        setProducts(prods);
      }
    );

    return () => {
      unsubscribeReels();
      unsubscribeProducts();
    };
  }, []);

  const currentReel = reels[activeIndex];

  useEffect(() => {
    if (currentReel?.embedCode) {
      const scriptId = 'instagram-embed-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
      } else {
        // Process new embeds if script is already loaded
        setTimeout(() => {
          (window as any).instgrm?.Embeds?.process();
        }, 100);
      }
    }
  }, [currentReel?.id]);

  if (loading || reels.length === 0) return null;

  const linkedProduct = products[currentReel.productId];

  const nextReel = () => {
    setActiveIndex((prev) => (prev + 1) % reels.length);
  };

  const prevReel = () => {
    setActiveIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 relative py-12">
      <div className="mb-10 text-center">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-widest text-brand-gold">
          Watch & Shop
        </span>
        <h2 className="text-3xl font-light md:text-5xl">Aura in Motion</h2>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Reel Player Container */}
        <div className="relative group w-full max-w-[400px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReel.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full relative"
            >
              {currentReel.embedCode ? (
                <div 
                  className="w-full h-full flex items-center justify-center overflow-auto bg-white"
                  dangerouslySetInnerHTML={{ __html: currentReel.embedCode }}
                />
              ) : (
                <video
                  src={currentReel.videoUrl}
                  autoPlay={isPlaying}
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                  onClick={() => setIsPlaying(!isPlaying)}
                />
              )}
              
              {/* Controls Overlay */}
              {!currentReel.embedCode && (
                <div className="absolute top-4 right-4 flex flex-col gap-3">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              )}

              {!isPlaying && !currentReel.embedCode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                  <Play size={64} className="text-white opacity-80" fill="white" />
                </div>
              )}

              {/* Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {currentReel.caption || `Styling the ${linkedProduct?.name || 'Collection'}`}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <button 
            onClick={prevReel}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextReel}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Product Info / Reels Cart */}
        <div className="w-full lg:w-96">
          <AnimatePresence mode="wait">
            {linkedProduct ? (
              <motion.div
                key={linkedProduct.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl p-8 border border-brand-dark/5 shadow-xl flex flex-col"
              >
                <div className="mb-6 aspect-square rounded-2xl overflow-hidden bg-[#F9F9F9]">
                  <img 
                    src={linkedProduct.images?.[0] || 'https://picsum.photos/seed/jewelry/800/800'} 
                    alt={linkedProduct.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Featured in Reel</span>
                    <h3 className="text-2xl font-medium mt-1">{linkedProduct.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">₹{linkedProduct.price.toLocaleString()}</span>
                    <span className="text-sm text-brand-dark/30 line-through">₹{(linkedProduct.price * 1.5).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-brand-dark/60 line-clamp-3">
                    {linkedProduct.description}
                  </p>
                  
                  <div className="pt-4 flex flex-col gap-3">
                    <Button 
                      onClick={() => addToCart(linkedProduct)}
                      className="w-full h-14 rounded-xl bg-brand-dark text-white hover:bg-brand-dark/90 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest"
                    >
                      <ShoppingBag size={18} /> Add to Cart
                    </Button>
                    <Link 
                      to={`/products/${linkedProduct.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full h-12 rounded-xl border-brand-dark/10 text-brand-dark hover:bg-brand-dark/5 flex items-center justify-center"
                      )}
                    >
                      View Product Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 border-2 border-dashed border-brand-dark/10 rounded-3xl">
                <div className="space-y-4">
                  <ShoppingBag size={48} className="mx-auto text-brand-dark/10" />
                  <p className="text-brand-dark/40">Select a reel to shop the jewelry</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Quick Reel Thumbs */}
          <div className="mt-8 grid grid-cols-4 gap-3">
            {reels.map((reel, idx) => (
              <button
                key={reel.id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all",
                  activeIndex === idx ? "border-brand-gold scale-105 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                {reel.thumbnail ? (
                  <img src={reel.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-brand-dark flex items-center justify-center">
                    <ChevronRight size={16} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
