import { useState, useEffect } from 'react';
import Hero from '@/components/home/Hero';
import ReelsSection from '@/components/home/ReelsSection';
import ProductCard from '@/components/products/ProductCard';
import { db } from '@/firebase';
import { collection, onSnapshot, query, where, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { Product } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    try {
      await addDoc(collection(db, 'subscribers'), {
        email,
        subscribedAt: serverTimestamp()
      });
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'products'), 
      where('isFeatured', '==', true),
      limit(3)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setFeaturedProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching featured products:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-20 pb-20">
      <Hero />
      <ReelsSection />

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Certified Quality', desc: 'Every piece is certified for authenticity and quality.' },
            { icon: Truck, title: 'Free Shipping', desc: 'Enjoy free insured shipping on all orders over $500.' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free return policy for your peace of mind.' },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-medium">{feature.title}</h3>
              <p className="text-brand-dark/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-2 block text-sm font-semibold uppercase tracking-widest text-brand-gold">
              Curated Selection
            </span>
            <h2 className="text-4xl font-light md:text-5xl">Featured Collections</h2>
          </div>
          <Link to="/products" className={cn(buttonVariants({ variant: "link" }), "text-brand-gold flex items-center gap-2")}>
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-brand-dark/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="bg-brand-dark py-24 text-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1573408302185-91275f96399c?auto=format&fit=crop&q=80&w=800"
                alt="Craftsmanship"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="mb-4 block text-sm font-semibold uppercase tracking-widest text-brand-gold">
                Our Story
              </span>
              <h2 className="mb-8 text-4xl font-light leading-tight md:text-5xl">
                Crafting Timeless <br />
                <span className="italic text-brand-champagne">Masterpieces</span>
              </h2>
              <p className="mb-8 text-lg text-brand-paper/70">
                At Aura, we believe that jewelry is more than just an accessory. It's a reflection of your unique story, a celebration of milestones, and a legacy to be passed down.
              </p>
              <p className="mb-10 text-lg text-brand-paper/70">
                Our artisans combine traditional techniques with modern design to create pieces that are as unique as the individuals who wear them.
              </p>
              <Link to="/about" className={cn(buttonVariants(), "bg-brand-gold text-white hover:bg-brand-gold/90")}>
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
        <div className="rounded-3xl bg-brand-champagne/30 p-12 text-center md:p-20">
          <h2 className="mb-4 text-4xl font-light md:text-5xl">Join the Aura Circle</h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-brand-dark/70">
            Subscribe to receive exclusive offers, early access to new collections, and style inspiration delivered to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="mx-auto flex max-w-md flex-col items-center gap-4 sm:flex-row sm:items-stretch">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full flex-1 rounded-full border border-brand-dark/10 bg-white px-6 py-3 focus:border-brand-gold focus:outline-none sm:w-auto"
              required
            />
            <Button type="submit" disabled={isSubscribing} className="h-auto rounded-full bg-brand-dark px-8 py-3 text-white hover:bg-brand-dark/90 disabled:opacity-50">
              {isSubscribing ? '...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
