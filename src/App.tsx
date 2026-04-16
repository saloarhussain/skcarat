import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import WishlistPage from '@/pages/WishlistPage';
import BlogPage from '@/pages/BlogPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboard from '@/pages/AdminDashboard';
import CheckoutPage from '@/pages/CheckoutPage';
import { PrivacyPolicy, TermsOfService, RefundPolicy, CustomerSupport } from '@/pages/LegalPages';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { FirebaseProvider } from '@/providers/FirebaseProvider';
import { CartProvider } from '@/providers/CartProvider';

function AppContent() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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

  return (
    <div className="min-h-screen bg-brand-paper">
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/support" element={<CustomerSupport />} />
          {/* Add more routes here */}
        </Routes>
      </main>
      {!isAdminRoute && (
        <footer className="border-t border-brand-dark/10 bg-white py-12">
          <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
              <div className="col-span-1 md:col-span-2">
                <span className="font-serif text-3xl font-bold tracking-tighter text-brand-dark">AURA</span>
                <p className="mt-4 max-w-xs text-brand-dark/60">
                  Exquisite jewelry crafted for your most precious moments. Celebrate life with Aura.
                </p>
                <form onSubmit={handleSubscribe} className="mt-6 flex max-w-xs gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-brand-dark/20 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={isSubscribing}
                    className="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark/90 disabled:opacity-50"
                  >
                    {isSubscribing ? '...' : 'Subscribe'}
                  </button>
                </form>
              </div>
              <div>
                <h4 className="mb-4 font-serif text-lg font-medium">Shop</h4>
                <ul className="space-y-2 text-sm text-brand-dark/60">
                  <li><Link to="/products?category=rings" className="hover:text-brand-gold">Rings</Link></li>
                  <li><Link to="/products?category=necklaces" className="hover:text-brand-gold">Necklaces</Link></li>
                  <li><Link to="/products?category=earrings" className="hover:text-brand-gold">Earrings</Link></li>
                  <li><Link to="/products?category=bracelets" className="hover:text-brand-gold">Bracelets</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-serif text-lg font-medium">Company</h4>
                <ul className="space-y-2 text-sm text-brand-dark/60">
                  <li><Link to="/about" className="hover:text-brand-gold">About Us</Link></li>
                  <li><Link to="/blog" className="hover:text-brand-gold">Blog</Link></li>
                  <li><Link to="/support" className="hover:text-brand-gold">Support</Link></li>
                  <li><Link to="/faq" className="hover:text-brand-gold">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-serif text-lg font-medium">Policies</h4>
                <ul className="space-y-2 text-sm text-brand-dark/60">
                  <li><Link to="/privacy" className="hover:text-brand-gold">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-brand-gold">Terms of Service</Link></li>
                  <li><Link to="/refund" className="hover:text-brand-gold">Refund Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t border-brand-dark/10 pt-8 text-center">
              <p className="text-sm text-brand-dark/60">
                © 2024 Aura Jewelry. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </FirebaseProvider>
  );
}
