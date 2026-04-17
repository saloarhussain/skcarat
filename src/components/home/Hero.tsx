import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Hero() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'theme_config'), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data());
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-brand-dark">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920"
          alt="Luxury Jewelry"
          className="h-full w-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/40 to-transparent" />
      </div>

      <div className="container relative mx-auto flex h-full items-center px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em] text-brand-gold">
              New Collection 2024
            </span>
            <h1 className="mb-6 font-serif text-6xl font-light leading-tight text-white md:text-8xl">
              {config?.heroTitle || 'Elegance in'} <br />
              <span className="italic text-brand-champagne">{config?.heroSubtitle ? '' : 'Every Detail'}</span>
              {config?.heroSubtitle && <div className="text-3xl md:text-4xl not-italic mt-4 text-brand-paper/80 font-sans">{config.heroSubtitle}</div>}
            </h1>
            {!config?.heroSubtitle && (
              <p className="mb-10 text-lg text-brand-paper/80">
                Discover our curated selection of fine jewelry, crafted with passion and precision to celebrate your most precious moments.
              </p>
            )}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/products" className={cn(buttonVariants({ size: "lg" }), "bg-brand-gold text-white hover:bg-brand-gold/90 px-8 py-6 text-lg")}>
                Shop Collection
              </Link>
              <Link to="/blog" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white text-white hover:bg-white hover:text-brand-dark px-8 py-6 text-lg")}>
                Style Tips
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="flex flex-col items-end gap-4">
          <div className="h-px w-32 bg-brand-gold/50" />
          <span className="text-xs uppercase tracking-widest text-brand-gold/50">
            Est. 2024
          </span>
        </div>
      </div>
    </section>
  );
}
