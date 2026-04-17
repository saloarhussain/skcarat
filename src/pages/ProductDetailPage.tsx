import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Share2, 
  Sparkles, 
  MapPin, 
  ChevronRight,
  CheckCircle2,
  Tag,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useCart } from '@/providers/CartProvider';
import { getPersonalizedRecommendations } from '@/services/geminiService';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { db } from '@/firebase';
import { doc, onSnapshot, query, collection, where, limit, getDocs } from 'firebase/firestore';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addItemToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [openSection, setOpenSection] = useState<string | null>('about');
  const [isGift, setIsGift] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const unsubscribe = onSnapshot(doc(db, 'products', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as Product;
        setProduct(data);
        
        const validVariants = data.variants?.filter(v => !!v.image) || [];
        if (validVariants.length > 0 && !selectedFinish) {
          setSelectedFinish(validVariants[0].name);
        }
      } else {
        setProduct(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching product:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, selectedFinish]);

  useEffect(() => {
    if (product) {
      const fetchRecommendations = async () => {
        try {
          const q = query(
            collection(db, 'products'), 
            where('category', '==', product.category),
            limit(5)
          );
          const snapshot = await getDocs(q);
          const recs = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Product))
            .filter(p => p.id !== product.id)
            .slice(0, 4);
          
          setRecommendations(recs);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      };
      fetchRecommendations();
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-light">Product not found</h2>
        <Link to="/products" className={cn(buttonVariants(), "mt-6 bg-brand-gold text-white")}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const handlePincodeCheck = () => {
    if (pincode.length === 6) {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      setDeliveryDate(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }));
    } else {
      toast.error('Please enter a valid 6-digit pincode');
    }
  };

  const addToCart = () => {
    if (product) {
      addItemToCart(product, 1, isGift);
    }
  };

  const buyNow = () => {
    if (product) {
      addItemToCart(product, 1, isGift);
      navigate('/cart');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Code ${text} copied to clipboard!`);
  };

  const isGold = product.name.toLowerCase().includes('gold') || product.category === 'rings'; // Simplified logic

  return (
    <div className="bg-white m-[5px]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-12 md:py-20">
        {/* Breadcrumbs */}
        <div className="mb-10 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">
          <Link to="/" className="hover:text-brand-gold">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-brand-gold">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-brand-dark">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Left: Product Images */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 flex flex-col gap-6">
              <div className="aspect-square overflow-hidden rounded-sm bg-[#F9F9F9]">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square w-24 flex-shrink-0 overflow-hidden rounded-sm border transition-all ${
                      selectedImage === i ? 'border-brand-gold ring-1 ring-brand-gold' : 'border-transparent bg-[#F9F9F9]'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-7">
            <div className="flex flex-col lg:pl-4">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-brand-dark">₹{product.price.toLocaleString()}</span>
                    <span className="text-xl text-brand-dark/40 line-through">₹{(product.price * 1.5).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toast.info('Added to Wishlist!')}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-dark/40 shadow-sm transition-colors hover:text-[#E98B8B]"
                    >
                      <Heart className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product.name,
                            url: window.location.href,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied to clipboard!');
                        }
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-dark/40 shadow-sm transition-colors hover:text-brand-gold"
                    >
                      <Share2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-[10px] font-medium text-brand-dark/60">MRP incl. of all taxes</p>
              </div>

              <div className="mb-8">
                {product.label && (
                  <Badge className="mb-4 bg-[#E98B8B] text-white hover:bg-[#E98B8B]/90 border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                    {product.label}
                  </Badge>
                )}
                <h1 className="mb-2 text-xl font-medium font-epilogue text-brand-dark/80">{product.name}</h1>
              </div>

              {product.compareAtPrice && product.compareAtPrice > product.price ? (
                <div className="mb-10">
                  <div className="inline-flex items-center gap-3 rounded-lg bg-green-50/80 px-4 py-2.5 border border-green-200 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-green-700">Price Drop</span>
                      <span className="text-[13px] font-medium text-green-600">
                        You save ₹{(product.compareAtPrice - product.price).toLocaleString()} ({Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% off)
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Choose Your Finish */}
              {product.variants && product.variants.filter(v => !!v.image).length > 0 && (
                <div className="mb-10">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-dark">Choose Your Finish</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {product.variants.filter(v => !!v.image).map((finish) => (
                      <button 
                        key={finish.name} 
                        onClick={() => setSelectedFinish(finish.name)}
                        className={cn(
                          "group flex flex-col items-center rounded-xl border p-2 transition-all hover:shadow-md",
                          selectedFinish === finish.name 
                            ? "border-brand-gold bg-brand-gold/[0.02] shadow-sm" 
                            : "border-brand-dark/5 bg-white hover:border-brand-gold/30"
                        )}
                      >
                        <div className="mb-2 aspect-square w-full overflow-hidden rounded-lg bg-[#F9F9F9]">
                          <img src={finish.image} alt={finish.name} className="h-full w-full object-contain mix-blend-multiply transition-transform group-hover:scale-110" />
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest transition-colors",
                          selectedFinish === finish.name ? "text-brand-gold" : "text-brand-dark/60"
                        )}>
                          {finish.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Check Card */}
              <div className="mb-10 rounded-xl border border-brand-dark/5 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-dark">Estimated Delivery Time</h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter 6 digit pincode" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-12 rounded-lg border-brand-dark/10 bg-[#F9F9F9] text-sm focus-visible:ring-brand-gold"
                  />
                  <Button 
                    onClick={handlePincodeCheck}
                    className="h-12 rounded-lg bg-[#FCE4EC] px-8 text-xs font-bold uppercase tracking-widest text-brand-dark hover:bg-[#F8BBD0]"
                  >
                    Check
                  </Button>
                </div>
                {deliveryDate && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Expected delivery by <span className="font-bold">{deliveryDate}</span></span>
                  </div>
                )}

                {/* Trust Icons Grid */}
                {(() => {
                  const features = product.features || ['15_day_return', 'lifetime_plating', '6_month_warranty', 'fine_material'];
                  if (features.length === 0) return null;
                  
                  return (
                    <div className="mt-8 grid grid-cols-2 gap-6 border-t border-brand-dark/10 pt-8">
                      {features.includes('15_day_return') && (
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-brand-gold/10">
                            <RefreshCw className="h-5 w-5 sm:h-7 sm:w-7 text-brand-gold" />
                          </div>
                          <span className="text-xs font-bold tracking-tight text-brand-dark/80 whitespace-nowrap">Easy 15 day return</span>
                        </div>
                      )}
                      {features.includes('lifetime_plating') && (
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-brand-gold/10">
                            <ShieldCheck className="h-5 w-5 sm:h-7 sm:w-7 text-brand-gold" />
                          </div>
                          <span className="text-xs font-bold tracking-tight text-brand-dark/80 whitespace-nowrap">Lifetime plating</span>
                        </div>
                      )}
                      {features.includes('6_month_warranty') && (
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-brand-gold/10">
                            <Truck className="h-5 w-5 sm:h-7 sm:w-7 text-brand-gold" />
                          </div>
                          <span className="text-xs font-bold tracking-tight text-brand-dark/80 whitespace-nowrap">6-Month warranty</span>
                        </div>
                      )}
                      {features.includes('fine_material') && (
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-brand-gold/10">
                            <CheckCircle2 className="h-5 w-5 sm:h-7 sm:w-7 text-brand-gold" />
                          </div>
                          <span className="text-xs font-bold tracking-tight text-brand-dark/80 whitespace-nowrap">{isGold ? '18k gold quality' : 'Fine 925 silver'}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Offers Card */}
              {(product.offers && product.offers.length > 0) && (
                <div className="mb-10 rounded-xl border border-brand-dark/5 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/10">
                        <Tag className="h-4 w-4 text-brand-gold" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">Offers For You</span>
                    </div>
                    <span className="text-[10px] text-brand-dark/40 font-medium">(Can be applied at checkout)</span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Primary Offer */}
                    {(showAllOffers ? product.offers : product.offers.slice(0, 1)).map((offer, idx) => (
                      <div 
                        key={idx} 
                        className="group relative overflow-hidden rounded-lg border border-brand-dark/5 bg-[#F9F9F9] p-4 transition-all hover:border-brand-gold/30"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                              <Tag className="h-3.5 w-3.5 text-[#E91E63]" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-brand-dark uppercase tracking-tight">
                                {offer.title}
                              </p>
                              <p className="text-[10px] text-brand-dark/60">
                                {offer.description}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(offer.code)}
                            className="flex flex-col items-center gap-1 rounded border border-brand-gold/20 bg-white px-3 py-1.5 transition-all hover:bg-brand-gold hover:text-white group-hover:border-brand-gold"
                          >
                            <span className="text-[10px] font-bold tracking-widest">{offer.code}</span>
                            <span className="text-[7px] uppercase font-bold opacity-60">Tap to copy</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {product.offers.length > 1 && (
                      <button 
                        onClick={() => setShowAllOffers(!showAllOffers)}
                        className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 hover:text-brand-gold transition-colors flex items-center justify-center gap-1"
                      >
                        {showAllOffers ? 'See Less' : `See ${product.offers.length - 1} More Offers`}
                        <ChevronRight className={cn("h-3 w-3 transition-transform", showAllOffers ? "-rotate-90" : "rotate-90")} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Gift Wrap Option */}
              <div className="mb-6 flex items-center gap-3">
                <button 
                  onClick={() => setIsGift(!isGift)}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded border transition-all",
                    isGift ? "border-[#E91E63] bg-[#E91E63] text-white" : "border-brand-dark/20 bg-white"
                  )}
                >
                  {isGift && <CheckCircle2 className="h-4 w-4" />}
                </button>
                <p className="text-sm font-medium text-brand-dark">
                  Is this a <span className="text-[#E91E63]">Gift?</span> 🎁 Wrap it for just (₹50)
                </p>
              </div>

              {/* Actions */}
              <div className="mb-12 flex gap-3">
                <Button 
                  onClick={addToCart} 
                  className="h-14 flex-1 rounded-xl bg-[#FCE4EC] text-xs font-bold uppercase tracking-widest text-brand-dark shadow-sm transition-transform hover:scale-[1.02] hover:bg-[#F8BBD0] active:scale-[0.98]"
                >
                  Add to Cart
                </Button>
                <Button 
                  onClick={buyNow} 
                  className="h-14 flex-1 rounded-xl bg-brand-dark text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-brand-dark/90 active:scale-[0.98]"
                >
                  Buy Now
                </Button>
              </div>

              {/* Accordion Sections Card */}
              {(() => {
                const sections = [
                  { id: 'about', title: 'About the Product', content: product.about || product.description },
                  { id: 'details', title: 'Product Details', content: product.details },
                  { id: 'shipping', title: 'Shipping & Returns', content: product.shippingReturns },
                ].filter(s => !!s.content && s.content.trim() !== '');

                if (sections.length === 0) return null;

                return (
                  <div className="mb-12 overflow-hidden rounded-xl border border-brand-dark/5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    {sections.map((section, index) => (
                      <div key={section.id} className={cn(index !== 0 && "border-t border-brand-dark/5")}>
                        <button 
                          onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-brand-dark/[0.02]"
                        >
                          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-dark">{section.title}</span>
                          <ChevronRight className={`h-4 w-4 text-brand-dark/40 transition-transform ${openSection === section.id ? 'rotate-90' : ''}`} />
                        </button>
                        {openSection === section.id && (
                          <div className="px-5 pb-5 text-xs leading-relaxed text-brand-dark/60 whitespace-pre-wrap">
                            {section.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Pair It Up */}
        {recommendations.length > 0 && (
          <section className="mt-32 border-t border-brand-dark/5 pt-20">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/10">
                <Sparkles className="h-5 w-5 text-brand-gold" />
              </div>
              <h2 className="text-3xl font-bold text-brand-dark">Pair It Up To Complete The Look!</h2>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {recommendations.slice(0, 5).map((rec) => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
