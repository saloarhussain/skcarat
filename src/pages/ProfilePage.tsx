import { useState, useEffect } from 'react';
import { User, Package, Heart, Star, Gift, Settings, LogOut, ChevronRight, LogIn, ShieldCheck } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MOCK_PRODUCTS } from '@/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/FirebaseProvider';
import { auth, db } from '@/firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, query, collection, where, orderBy, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import LoginModal from '@/components/auth/LoginModal';
import { Product } from '@/types';

import { seedProducts } from '@/seed';

export default function ProfilePage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [checkoutSettings, setCheckoutSettings] = useState({
    emailVerificationEnabled: true,
    phoneVerificationEnabled: true,
  });

  useEffect(() => {
    if (isAdmin) {
      const unsubscribe = onSnapshot(doc(db, 'settings', 'checkout'), (doc) => {
        if (doc.exists()) {
          setCheckoutSettings(doc.data() as any);
        }
      });
      return () => unsubscribe();
    }
  }, [isAdmin]);

  const toggleSetting = async (key: 'emailVerificationEnabled' | 'phoneVerificationEnabled') => {
    try {
      const newSettings = {
        ...checkoutSettings,
        [key]: !checkoutSettings[key],
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'settings', 'checkout'), newSettings);
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };
  const [profileData, setProfileData] = useState({
    loyaltyPoints: 0,
    tier: 'Silver',
    nextTierPoints: 1000,
  });
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for user profile data (loyalty points, tier)
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfileData({
          loyaltyPoints: data.loyaltyPoints || 0,
          tier: data.tier || 'Silver',
          nextTierPoints: data.nextTierPoints || 1000,
        });
      }
    });

    // Real-time listener for user orders
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserOrders(ordersData);
    });

    return () => {
      unsubscribeUser();
      unsubscribeOrders();
    };
  }, [user]);

  // Wishlist fetching logic (similar to WishlistPage for consistency)
  useEffect(() => {
    if (!user) return;

    const unsubscribeWishlist = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const wishlistIds = userData.wishlist || [];
        
        if (wishlistIds.length > 0) {
          const q = query(collection(db, 'products'), where('__name__', 'in', wishlistIds.slice(0, 10)));
          const querySnapshot = await getDocs(q);
          const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setWishlistItems(products);
        } else {
          setWishlistItems([]);
        }
      }
    });

    return () => unsubscribeWishlist();
  }, [user]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedProducts();
      toast.success('Database seeded successfully');
    } catch (error) {
      toast.error('Failed to seed database');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
            <User className="h-10 w-10" />
          </div>
        </div>
        <h2 className="mb-4 text-3xl font-light">Sign in to view your profile</h2>
        <p className="mb-8 text-brand-dark/60">Access your orders, wishlist, and loyalty rewards.</p>
        <Button onClick={() => setIsLoginModalOpen(true)} className="bg-brand-gold text-white">
          <LogIn className="mr-2 h-4 w-4" /> Sign In
        </Button>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  const sidebarItems = [
    { icon: User, label: 'Personal Info', value: 'personal' },
    { icon: Package, label: 'My Orders', value: 'orders' },
    { icon: Heart, label: 'Wishlist', value: 'wishlist' },
    { icon: Gift, label: 'Loyalty Program', value: 'loyalty' },
    { icon: Settings, label: 'Settings', value: 'settings' },
  ];

  if (isAdmin) {
    sidebarItems.push({ icon: ShieldCheck, label: 'Admin Panel', value: 'admin' });
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-gold/20 text-brand-gold">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="h-12 w-12" />
                )}
              </div>
              <h2 className="text-2xl font-medium">{user.displayName || 'User'}</h2>
              <p className="text-sm text-brand-dark/60">{user.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gold px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">
                <Star className="h-3 w-3 fill-current" /> {profileData.tier} Member
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;

                return (
                  <Button
                    key={i}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="justify-start gap-3 rounded-lg"
                    onClick={() => setActiveTab(item.value)}
                  >
                    <Icon className="h-4 w-4" /> {item.label}
                  </Button>
                );
              })}
              <Separator className="my-2" />
              <Button onClick={handleSignOut} variant="ghost" className="justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 min-h-[500px]">
          {activeTab === 'personal' && (
            <Card className="border-brand-dark/10 bg-white">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your personal details and account information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Full Name</p>
                    <p className="font-medium">{user.displayName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Phone Number</p>
                    <p className="font-medium">Not provided</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Member Since</p>
                    <p className="font-medium">April 2024</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-full">Edit Profile</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'loyalty' && (
            <div className="flex flex-col gap-8">
              {/* Loyalty Progress */}
              <Card className="border-none bg-brand-dark text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif text-2xl text-brand-champagne">
                    <Gift className="h-6 w-6" /> Aura Rewards
                  </CardTitle>
                  <CardDescription className="text-brand-paper/60">
                    Earn points on every purchase and unlock exclusive benefits.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <span className="text-4xl font-bold text-brand-gold">{profileData.loyaltyPoints}</span>
                      <span className="ml-2 text-sm uppercase tracking-widest text-brand-paper/60">Points Available</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-brand-paper/60">Next Tier: Platinum</span>
                    </div>
                  </div>
                  <Progress value={(profileData.loyaltyPoints / profileData.nextTierPoints) * 100} className="h-2 bg-white/10" />
                  <p className="mt-4 text-sm text-brand-paper/60">
                    You need {profileData.nextTierPoints - profileData.loyaltyPoints} more points to reach Platinum status.
                  </p>
                </CardContent>
              </Card>

              {/* Available Rewards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  { title: '$50 Discount', points: 500, desc: 'Get $50 off your next purchase over $500.' },
                  { title: 'Free Jewelry Cleaning', points: 200, desc: 'Professional cleaning for any Aura piece.' },
                  { title: 'Priority Access', points: 1000, desc: 'Early access to new collection launches.' },
                  { title: 'Birthday Gift', points: 0, desc: 'A special surprise on your birthday.', earned: true },
                ].map((reward, i) => (
                  <Card key={i} className="border-brand-dark/5 bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription>{reward.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <span className="text-sm font-bold text-brand-gold">
                        {reward.points > 0 ? `${reward.points} Points` : 'Exclusive'}
                      </span>
                      <Button
                        size="sm"
                        variant={reward.earned ? 'secondary' : 'outline'}
                        disabled={profileData.loyaltyPoints < reward.points && !reward.earned}
                        className="rounded-full"
                      >
                        {reward.earned ? 'Claimed' : 'Redeem'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4">
              {userOrders.length > 0 ? (
                userOrders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-4 rounded-xl border border-brand-dark/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-brand-dark">{order.id}</span>
                      <span className="text-xs text-brand-dark/60">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'} • {order.items?.length || 0} item(s)</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col text-right">
                        <span className="text-lg font-semibold">₹{order.total?.toLocaleString()}</span>
                        <span className={cn(
                          "text-xs font-bold uppercase",
                          order.status === 'delivered' ? "text-green-600" : "text-brand-gold"
                        )}>{order.status}</span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-brand-dark/40">No orders found yet.</div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <Card className="border-brand-dark/10 bg-white">
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later.</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {wishlistItems.map((product) => (
                      <div key={product.id} className="group relative flex flex-col gap-3">
                        <div className="aspect-square overflow-hidden rounded-xl bg-brand-champagne/20">
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium line-clamp-1">{product.name}</h4>
                          <p className="text-sm text-brand-gold">₹{product.price.toLocaleString()}</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full rounded-full">Add to Cart</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-brand-dark/40">Your wishlist is empty.</div>
                )}
                <div className="mt-8 text-center">
                  <Link to="/products" className="text-sm font-medium text-brand-gold hover:underline">
                    Browse more products
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card className="border-brand-dark/10 bg-white">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-brand-dark/60">Receive updates about your orders and rewards.</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-brand-dark/60">Change your account password.</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'admin' && isAdmin && (
            <Card className="border-brand-dark/10 bg-white">
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>Manage application settings and database.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Checkout Verification</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between rounded-lg border border-brand-dark/5 p-4">
                      <div>
                        <h4 className="font-medium">Email OTP Verification</h4>
                        <p className="text-sm text-brand-dark/60">Require users to verify their email during checkout.</p>
                      </div>
                      <Button 
                        onClick={() => toggleSetting('emailVerificationEnabled')}
                        variant={checkoutSettings.emailVerificationEnabled ? "default" : "outline"}
                        className={cn(checkoutSettings.emailVerificationEnabled ? "bg-green-600 hover:bg-green-700" : "")}
                      >
                        {checkoutSettings.emailVerificationEnabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-brand-dark/5 p-4">
                      <div>
                        <h4 className="font-medium">Mobile OTP Verification</h4>
                        <p className="text-sm text-brand-dark/60">Require users to verify their phone number during checkout.</p>
                      </div>
                      <Button 
                        onClick={() => toggleSetting('phoneVerificationEnabled')}
                        variant={checkoutSettings.phoneVerificationEnabled ? "default" : "outline"}
                        className={cn(checkoutSettings.phoneVerificationEnabled ? "bg-green-600 hover:bg-green-700" : "")}
                      >
                        {checkoutSettings.phoneVerificationEnabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Database Actions</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between rounded-lg border border-brand-dark/5 p-4">
                      <div>
                        <h4 className="font-medium">Product Management</h4>
                        <p className="text-sm text-brand-dark/60">Manage products, prices, and exclusive offers.</p>
                      </div>
                      <Link to="/admin" className={cn(buttonVariants(), "bg-brand-gold text-white")}>
                        Go to Dashboard
                      </Link>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-brand-dark/5 p-4">
                      <div>
                        <h4 className="font-medium">Seed Products</h4>
                        <p className="text-sm text-brand-dark/60">Populate the Firestore database with initial mock products.</p>
                      </div>
                      <Button onClick={handleSeed} disabled={isSeeding} className="bg-brand-gold text-white">
                        {isSeeding ? 'Seeding...' : 'Seed Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-brand-dark/10 ${className}`} />;
}
