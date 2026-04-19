import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, MapPin, LogIn, ShieldCheck } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/FirebaseProvider';
import { useCart } from '@/providers/CartProvider';
import { auth, db } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import LoginModal from '@/components/auth/LoginModal';
import PincodeModal from './PincodeModal';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState<string | null>(null);
  const { user, loading, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [themeConfig, setThemeConfig] = useState<any>(null);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'theme_config'), (snapshot) => {
      if (snapshot.exists()) {
        setThemeConfig(snapshot.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const announcements = themeConfig?.announcements || (themeConfig?.announcementBar ? [themeConfig.announcementBar] : []);

  useEffect(() => {
    if (themeConfig?.showAnnouncementBar && announcements.length > 1) {
      const interval = setInterval(() => {
        setAnnouncementIndex(prev => (prev + 1) % announcements.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [themeConfig, announcements.length]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const navLinks = [
    { name: 'New Arrivals', href: '/products?filter=new' },
    { name: 'Rings', href: '/products?category=rings' },
    { name: 'Necklaces', href: '/products?category=necklaces' },
    { name: 'Earrings', href: '/products?category=earrings' },
    { name: 'Bracelets', href: '/products?category=bracelets' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Banner */}
      {themeConfig?.showAnnouncementBar && announcements.length > 0 && (
        <div className="bg-brand-champagne py-1.5 overflow-hidden h-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={announcementIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-brand-dark px-4 text-center"
            >
              {announcements[announcementIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <nav className="w-full border-b border-brand-dark/10 bg-brand-nav-bg/95 text-brand-nav-text backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
          {/* Top Row: Logo, Search, Actions */}
          <div className="flex h-16 md:h-20 items-center justify-between gap-4 md:gap-8">
            {/* Mobile Menu Trigger */}
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger render={<Button variant="ghost" size="icon" className="text-brand-nav-text" />}>
                  <Menu className="h-6 w-6" />
                </SheetTrigger>
                <SheetContent side="left" className="bg-brand-paper">
                  <div className="mt-12 flex flex-col gap-6 pl-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="text-xl font-medium hover:text-brand-gold transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                    <Separator className="my-4 bg-brand-dark/10 -ml-6" />
                    
                    <button 
                      onClick={() => setIsPincodeModalOpen(true)}
                      className="flex items-center gap-3 text-xl font-medium hover:text-brand-gold transition-colors"
                    >
                      <MapPin className="h-5 w-5 text-brand-gold" />
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Deliver to</span>
                        <span className="text-lg">{selectedPincode || 'Enter Pincode'}</span>
                      </div>
                    </button>

                    <Separator className="my-4 bg-brand-dark/10 -ml-6" />
                    {user ? (
                      <Link to="/profile" className="text-xl font-medium hover:text-brand-gold transition-colors">
                        My Account
                      </Link>
                    ) : (
                      <button onClick={() => setIsLoginModalOpen(true)} className="text-left text-xl font-medium hover:text-brand-gold transition-colors">
                        Login / Sign Up
                      </button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo & Delivery */}
            <div className="flex items-center gap-4 shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-serif text-2xl md:text-3xl font-bold tracking-tighter text-brand-nav-text">
                  AURA
                </span>
              </Link>

              <button 
                onClick={() => setIsPincodeModalOpen(true)}
                className="hidden lg:flex items-center gap-2 rounded-md border border-brand-dark/10 px-3 py-1.5 text-left transition-colors hover:bg-white/10"
              >
                <MapPin className="h-4 w-4 text-brand-gold" />
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-brand-nav-text/40">Deliver to</span>
                  <span className="text-[11px] font-bold text-brand-nav-text">
                    {selectedPincode || 'Enter Pincode'}
                  </span>
                </div>
              </button>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex relative flex-1 max-w-xl text-brand-dark">
              <Input
                type="text"
                placeholder='Search "Necklaces", "Rings" or "Earrings"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full border-brand-dark/10 bg-white pl-4 pr-10 rounded-md focus-visible:ring-brand-gold focus-visible:border-brand-gold text-sm shadow-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-dark/40" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2 shrink-0 text-brand-nav-text">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="hover:text-brand-gold transition-colors text-brand-nav-text">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:text-brand-gold transition-colors text-brand-nav-text">
                <div className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white border-2 border-brand-nav-bg">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Button>
            </Link>
 
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="text-brand-gold hover:bg-brand-gold/10 transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {loading ? (
              <div className="flex items-center justify-center w-10 h-10">
                <div className="h-5 w-5 animate-pulse rounded-full bg-brand-nav-text/10" />
              </div>
            ) : user ? (
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="hover:text-brand-gold transition-colors text-brand-nav-text">
                  <div className="h-6 w-6 overflow-hidden rounded-full border border-brand-nav-text/10">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="h-full w-full p-0.5" />
                    )}
                  </div>
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsLoginModalOpen(true)} className="hover:text-brand-gold transition-colors text-brand-nav-text">
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <PincodeModal 
          isOpen={isPincodeModalOpen} 
          onClose={() => setIsPincodeModalOpen(false)} 
          onSelect={setSelectedPincode}
        />

        {/* Mobile Search Row */}
        <div className="md:hidden px-4 pb-4 text-brand-dark">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder='Search "Necklaces", "Rings" or "Earrings"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full border-brand-dark/10 bg-white pl-4 pr-10 rounded-md focus-visible:ring-brand-gold focus-visible:border-brand-gold text-sm shadow-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-dark/40" />
          </div>
        </div>

        {/* Bottom Row: Category Links (Desktop Only) */}
        <div className="hidden md:flex h-10 items-center justify-center gap-8 border-t border-brand-dark/5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-nav-text/70 hover:text-brand-gold transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  </header>
);
}
