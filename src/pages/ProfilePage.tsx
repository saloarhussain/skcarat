import { useState, useEffect } from 'react';
import { User, Package, Heart, Star, Gift, Settings, LogOut, ChevronRight, LogIn } from 'lucide-react';
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
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import LoginModal from '@/components/auth/LoginModal';

import { seedProducts } from '@/seed';

export default function ProfilePage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    loyaltyPoints: 450,
    tier: 'Gold',
    nextTierPoints: 1000,
  });

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

  useEffect(() => {
    if (!loading && !user) {
      // toast.error('Please sign in to view your profile');
      // navigate('/');
    }
  }, [user, loading, navigate]);

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

  const orders = [
    { id: 'ORD-7721', date: '2024-02-15', total: 1299, status: 'Delivered', items: 1 },
    { id: 'ORD-6542', date: '2023-11-20', total: 450, status: 'Delivered', items: 1 },
  ];

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
              {[
                { icon: User, label: 'Personal Info', active: true },
                { icon: Package, label: 'My Orders' },
                { icon: Heart, label: 'Wishlist', href: '/wishlist' },
                { icon: Gift, label: 'Loyalty Program' },
                { icon: Settings, label: 'Settings' },
              ].map((item, i) => {
                const Icon = item.icon;
                if (item.href) {
                  return (
                    <Link
                      key={i}
                      to={item.href}
                      className={cn(
                        buttonVariants({ variant: item.active ? 'secondary' : 'ghost' }),
                        "justify-start gap-3 rounded-lg"
                      )}
                    >
                      <Icon className="h-4 w-4" /> {item.label}
                    </Link>
                  );
                }
                return (
                  <Button
                    key={i}
                    variant={item.active ? 'secondary' : 'ghost'}
                    className="justify-start gap-3 rounded-lg"
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
        <div className="lg:col-span-3">
          <Tabs defaultValue="loyalty" className="w-full">
            <TabsList className="mb-8 w-full justify-start border-b border-brand-dark/10 bg-transparent p-0">
              <TabsTrigger value="loyalty" className="rounded-none border-b-2 border-transparent px-8 pb-3 pt-0 data-[state=active]:border-brand-gold data-[state=active]:bg-transparent data-[state=active]:text-brand-gold">
                Loyalty & Rewards
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent px-8 pb-3 pt-0 data-[state=active]:border-brand-gold data-[state=active]:bg-transparent data-[state=active]:text-brand-gold">
                Order History
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="rounded-none border-b-2 border-transparent px-8 pb-3 pt-0 data-[state=active]:border-brand-gold data-[state=active]:bg-transparent data-[state=active]:text-brand-gold">
                  Admin Actions
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="loyalty" className="flex flex-col gap-8">
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
            </TabsContent>

            <TabsContent value="orders">
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-4 rounded-xl border border-brand-dark/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-brand-dark">{order.id}</span>
                      <span className="text-xs text-brand-dark/60">{order.date} • {order.items} item(s)</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col text-right">
                        <span className="text-lg font-semibold">${order.total.toLocaleString()}</span>
                        <span className="text-xs text-green-600">{order.status}</span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin">
                <Card className="border-brand-dark/10 bg-white">
                  <CardHeader>
                    <CardTitle>Database Management</CardTitle>
                    <CardDescription>Perform administrative tasks for the application.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
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
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-brand-dark/10 ${className}`} />;
}
