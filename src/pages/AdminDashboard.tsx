import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/FirebaseProvider';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Home, ShoppingBag, Package, Users, Megaphone, Ticket, BarChart, Settings, Search, Bell, User, ChevronDown, Plus, Edit, Trash2, Save, X, Image as ImageIcon, Tag, Info, Truck, Gift, MessageCircle, Mail, Upload, Trash, ExternalLink, Menu, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  type Tab = 'home' | 'orders' | 'products' | 'customers' | 'marketing' | 'notifications' | 'discounts' | 'analytics' | 'settings';
  const [activeTab, setActiveTab] = useState<Tab>('home');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    setOrdersLoading(true);
    setUsersLoading(true);
    setSubscribersLoading(true);

    // Real-time listener for Products
    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error('AdminDashboard: Error fetching products:', error);
      toast.error('Failed to load products: ' + error.message);
      setLoading(false);
    });

    // Real-time listener for Orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setOrdersLoading(false);
    }, (error) => {
      console.error('AdminDashboard: Error fetching orders:', error);
      toast.error('Failed to load orders: ' + error.message);
      setOrdersLoading(false);
    });

    // Real-time listener for Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setUsersLoading(false);
    }, (error) => {
      console.error('AdminDashboard: Error fetching users:', error);
      toast.error('Failed to fetch users: ' + error.message);
      setUsersLoading(false);
    });

    // Real-time listener for Subscribers
    const unsubscribeSubscribers = onSnapshot(collection(db, 'subscribers'), (snapshot) => {
      const subscribersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscribers(subscribersData);
      setSubscribersLoading(false);
    }, (error) => {
      console.error('AdminDashboard: Error fetching subscribers:', error);
      toast.error('Failed to fetch subscribers: ' + error.message);
      setSubscribersLoading(false);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeSubscribers();
    };
  }, [isAdmin]);

  const [authSettings, setAuthSettings] = useState({
    emailEnabled: true,
    googleEnabled: true,
    whatsappEnabled: false,
    privacyPolicyUrl: '/privacy-policy',
    termsUrl: '/terms',
    supportEmail: 'support@aurajewelry.com',
    whatsappNumber: '+919876543210'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    orderConfirmation: {
      subject: 'Order Confirmed! Your Aura Jewelry Order #{{orderId}}',
      senderName: 'Aura Jewelry',
      replyTo: 'support@aurajewelry.com',
      enabled: true
    },
    orderCancelled: {
      subject: 'Order Cancelled - #{{orderId}}',
      senderName: 'Aura Jewelry',
      replyTo: 'support@aurajewelry.com',
      enabled: true
    },
    orderFailed: {
      subject: 'Payment Failed - #{{orderId}}',
      senderName: 'Aura Jewelry',
      replyTo: 'support@aurajewelry.com',
      enabled: true
    }
  });

  const [smtpSettings, setSmtpSettings] = useState({
    host: 'smtp.gmail.com',
    port: '465',
    encryption: 'SSL/TLS',
    username: '',
    password: ''
  });

  const [razorpaySettings, setRazorpaySettings] = useState({
    keyId: '',
    keySecret: '',
    enabled: false
  });

  const [isRazorpayConfigOpen, setIsRazorpayConfigOpen] = useState(false);

  const [stripeSettings, setStripeSettings] = useState({
    publishableKey: '',
    secretKey: '',
    enabled: false
  });

  const [isStripeConfigOpen, setIsStripeConfigOpen] = useState(false);

  const [wiseSettings, setWiseSettings] = useState({
    accountHolder: '',
    accountNumber: '',
    currency: 'USD',
    swiftBic: '',
    enabled: false
  });

  const [isWiseConfigOpen, setIsWiseConfigOpen] = useState(false);

  const [codSettings, setCodSettings] = useState({
    enabled: true
  });

  const [checkoutSettings, setCheckoutSettings] = useState({
    emailVerificationEnabled: true,
    phoneVerificationEnabled: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Auth Settings
        const authDoc = await getDoc(doc(db, 'settings', 'auth_config'));
        if (authDoc.exists()) setAuthSettings(authDoc.data() as any);

        // Notification Settings
        const notifyDoc = await getDoc(doc(db, 'settings', 'notification_config'));
        if (notifyDoc.exists()) setNotificationSettings(notifyDoc.data() as any);

        // SMTP Settings
        const smtpDoc = await getDoc(doc(db, 'settings', 'smtp_config'));
        if (smtpDoc.exists()) setSmtpSettings(smtpDoc.data() as any);

        // Razorpay Settings
        const razorDoc = await getDoc(doc(db, 'settings', 'razorpay_config'));
        if (razorDoc.exists()) setRazorpaySettings(razorDoc.data() as any);

        // Stripe Settings
        const stripeDoc = await getDoc(doc(db, 'settings', 'stripe_config'));
        if (stripeDoc.exists()) setStripeSettings(stripeDoc.data() as any);

        // Wise Settings
        const wiseDoc = await getDoc(doc(db, 'settings', 'wise_config'));
        if (wiseDoc.exists()) setWiseSettings(wiseDoc.data() as any);

        // COD Settings
        const codDoc = await getDoc(doc(db, 'settings', 'cod_config'));
        if (codDoc.exists()) setCodSettings(codDoc.data() as any);

        // Checkout Settings
        const checkoutDoc = await getDoc(doc(db, 'settings', 'checkout'));
        if (checkoutDoc.exists()) setCheckoutSettings(checkoutDoc.data() as any);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const saveAuthSettings = async (newSettings: any) => {
    try {
      await setDoc(doc(db, 'settings', 'auth_config'), newSettings);
      setAuthSettings(newSettings);
      toast.success('Authentication settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const saveNotificationSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'notification_config'), notificationSettings);
      toast.success('Notification templates saved');
    } catch (error) {
      toast.error('Failed to save templates');
    }
  };

  const saveSmtpSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'smtp_config'), smtpSettings);
      toast.success('SMTP credentials updated');
    } catch (error) {
      toast.error('Failed to update credentials');
    }
  };

  const saveRazorpaySettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'razorpay_config'), razorpaySettings);
      toast.success('Razorpay configuration saved');
      setIsRazorpayConfigOpen(false);
    } catch (error) {
      toast.error('Failed to save Razorpay configuration');
    }
  };

  const saveStripeSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'stripe_config'), stripeSettings);
      toast.success('Stripe configuration saved');
      setIsStripeConfigOpen(false);
    } catch (error) {
      toast.error('Failed to save Stripe configuration');
    }
  };

  const saveWiseSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'wise_config'), wiseSettings);
      toast.success('Wise configuration saved');
      setIsWiseConfigOpen(false);
    } catch (error) {
      toast.error('Failed to save Wise configuration');
    }
  };

  const saveCodSettings = async (enabled: boolean) => {
    try {
      const newSettings = { enabled };
      await setDoc(doc(db, 'settings', 'cod_config'), newSettings);
      setCodSettings(newSettings);
      toast.success(`Cash on Delivery ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update COD settings');
    }
  };

  const saveCheckoutSettings = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...checkoutSettings, [key]: value };
      await setDoc(doc(db, 'settings', 'checkout'), newSettings);
      setCheckoutSettings(newSettings);
      toast.success('Checkout settings updated');
    } catch (error) {
      toast.error('Failed to update checkout settings');
    }
  };

  const handleTestEmail = async () => {
    if (!smtpSettings.username || !smtpSettings.password) {
      toast.error('Please enter SMTP username and password first');
      return;
    }

    const toastId = toast.loading('Sending test email...');
    try {
      const response = await fetch('/api/notifications/order-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: smtpSettings.username,
          orderId: 'TEST-12345',
          customerName: 'Admin User',
          amount: 9999,
          type: 'confirmed',
          smtpConfig: smtpSettings
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.message || 'Test email sent! Check your inbox (including spam).', { id: toastId });
      } else {
        toast.error(result.error || 'Failed to send test email. Check server console for details.', { id: toastId });
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Connection error. Is the server running?', { id: toastId });
    }
  };

  const sendOrderNotification = async (order: any, type: 'confirmed' | 'cancelled' | 'failed') => {
    try {
      await fetch('/api/notifications/order-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: order.email,
          orderId: order.id,
          customerName: order.customerName,
          amount: order.amount,
          items: order.items,
          type
        }),
      });
      console.log(`Notification email (${type}) sent to ${order.email}`);
    } catch (error) {
      console.error(`Failed to send ${type} email:`, error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Check total document size (approximate)
    const docString = JSON.stringify(editingProduct);
    const sizeInBytes = new Blob([docString]).size;
    
    if (sizeInBytes > 1000000) { // Slightly less than 1MB to be safe
      toast.error(`Product data is too large (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB). Please remove some images or use smaller files.`);
      return;
    }

    try {
      if (editingProduct.id) {
        // Update
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, editingProduct);
        toast.success('Product updated successfully');
      } else {
        // Add
        await addDoc(collection(db, 'products'), {
          ...editingProduct,
          rating: 5,
          reviewsCount: 0,
          images: editingProduct.images || [],
          variants: editingProduct.variants || []
        });
        toast.success('Product added successfully');
      }
      setEditingProduct(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startAdding = () => {
    setEditingProduct({
      name: '',
      description: '',
      price: 0,
      category: 'rings',
      images: [],
      stock: 10,
      about: '',
      details: '',
      shippingReturns: '',
      exclusiveOffers: '',
      label: '',
      isFeatured: false,
      isNew: true,
      variants: [
        { name: 'Silver', image: '' },
        { name: 'Rose Gold', image: '' },
        { name: 'Gold', image: '' }
      ],
      offers: [
        { title: 'EXTRA 15% OFF', description: 'on Silver Jewellery orders above ₹2999', code: 'AURA15' }
      ]
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'gallery' | 'variant', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading toast for compression
    const toastId = toast.loading("Processing image...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with 0.7 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        // Check size of compressed string (approximate bytes)
        const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
        
        if (sizeInBytes > 200 * 1024) { // If still > 200KB, something is wrong or it's very complex
          toast.error("Image is too complex even after compression. Try a smaller file.", { id: toastId });
          return;
        }

        if (type === 'gallery') {
          const newImages = [...(editingProduct?.images || [])];
          newImages.push(compressedBase64);
          setEditingProduct({ ...editingProduct!, images: newImages });
        } else if (type === 'variant' && index !== undefined) {
          const newVariants = [...(editingProduct?.variants || [])];
          newVariants[index] = { ...newVariants[index], image: compressedBase64 };
          setEditingProduct({ ...editingProduct!, variants: newVariants });
        }
        
        toast.success("Image added successfully", { id: toastId });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const totalSales = orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = users.length + subscribers.length;
  const activeProducts = products.length;

  const checkoutCustomers = Array.from(new Map(orders.map(order => [order.email, {
    name: order.customerName,
    email: order.email,
    phone: order.phone,
    totalSpent: orders.filter(o => o.email === order.email).reduce((sum, o) => sum + (o.amount || 0), 0),
    lastOrder: order.createdAt
  }])).values());

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        // Handle objects (like timestamps) or strings with commas
        if (val && typeof val === 'object' && val.seconds) {
          return `"${new Date(val.seconds * 1000).toLocaleString()}"`;
        }
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        
        // Force phone numbers and long numeric strings to be treated as text in Excel
        if (header.toLowerCase().includes('phone') || (escaped.length >= 10 && /^\d+$/.test(escaped))) {
          return `="\t${escaped}"`;
        }
        
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} exported successfully`);
  };

  const exportToJSON = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} exported successfully`);
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'discounts', label: 'Discounts', icon: Ticket },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F1F1F1]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F1F1F1] text-[#303030] font-sans overflow-hidden relative">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#EBEBEB] border-r border-[#D1D1D1] flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-brand-dark rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold text-lg tracking-tight">Aura Admin</span>
          </div>
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-[#E3E3E3] rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id as Tab);
                setEditingProduct(null);
                setIsAdding(false);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-white text-[#303030] shadow-sm" 
                  : "text-[#616161] hover:bg-[#E3E3E3] hover:text-[#303030]"
              )}
            >
              <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-brand-dark" : "text-[#616161]")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-[#D1D1D1]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === 'settings' 
                ? "bg-white text-[#303030] shadow-sm" 
                : "text-[#616161] hover:bg-[#E3E3E3] hover:text-[#303030]"
            )}
          >
            <Settings className={cn("h-5 w-5", activeTab === 'settings' ? "text-brand-dark" : "text-[#616161]")} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-[#1A1A1A] text-white flex items-center justify-between px-4 flex-shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 hover:bg-white/10 rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 max-w-2xl relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input 
                type="text"
                placeholder="Search"
                className="w-full bg-white/10 border-none rounded-md py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-white/20 placeholder:text-white/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <button className="p-1.5 hover:bg-white/10 rounded-md relative">
              <Bell className="h-5 w-5 text-white/80" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#1A1A1A]" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="h-7 w-7 bg-brand-gold rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden md:block">{user?.displayName || 'Admin'}</span>
              <ChevronDown className="h-4 w-4 text-white/40" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'home' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Home</h1>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white">Customize</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#616161]">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
                      <p className="text-xs text-green-600 mt-1 font-medium">↑ 12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#616161]">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalOrders}</div>
                      <p className="text-xs text-green-600 mt-1 font-medium">↑ 5% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#616161]">Total Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalCustomers}</div>
                      <p className="text-xs text-brand-dark/40 mt-1 font-medium">Active audience</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-[#F1F1F1] rounded flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-[#616161]" />
                              </div>
                              <div>
                                <p className="font-medium">#{order.id.slice(-6)}</p>
                                <p className="text-xs text-[#616161]">{order.customerName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{order.amount.toLocaleString()}</p>
                              <p className={cn(
                                "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                                order.status === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                              )}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                        ))}
                        <Button variant="link" className="w-full text-brand-gold p-0 h-auto text-sm" onClick={() => setActiveTab('orders')}>
                          View all orders
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Inventory Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#616161]">Total Products</span>
                          <span className="font-bold">{activeProducts}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#616161]">Low Stock Items</span>
                          <span className="font-bold text-red-500">{products.filter(p => p.stock < 5).length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#616161]">Out of Stock</span>
                          <span className="font-bold text-red-500">{products.filter(p => p.stock === 0).length}</span>
                        </div>
                        <Separator className="bg-[#F1F1F1]" />
                        <div className="pt-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#616161] mb-3">Top Categories</p>
                          <div className="space-y-2">
                            {['rings', 'necklaces', 'earrings', 'bracelets'].map(cat => (
                              <div key={cat} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{cat}</span>
                                <span className="text-[#616161]">{products.filter(p => p.category === cat).length}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : activeTab === 'products' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Products</h1>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportToCSV(products, 'products')}
                      className="bg-white"
                    >
                      <Download className="mr-2 h-4 w-4" /> CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportToJSON(products, 'products')}
                      className="bg-white"
                    >
                      <Download className="mr-2 h-4 w-4" /> JSON
                    </Button>
                    {!editingProduct && (
                      <Button onClick={startAdding} className="bg-brand-dark text-white hover:bg-brand-dark/90">
                        <Plus className="mr-2 h-4 w-4" /> Add product
                      </Button>
                    )}
                  </div>
                </div>
                {editingProduct ? (
                  <Card className="mb-12 border-none shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-2xl font-serif">
                        {isAdding ? 'Add New Product' : `Edit: ${editingProduct.name}`}
                      </CardTitle>
                      <CardDescription>Fill in the details below to update your product listing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Basic Info */}
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Product Name</label>
                            <Input 
                              value={editingProduct.name} 
                              onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                              required
                              placeholder="e.g. Eternal Rose Gold Ring"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Price (₹)</label>
                              <Input 
                                type="number"
                                value={editingProduct.price} 
                                onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Stock</label>
                              <Input 
                                type="number"
                                value={editingProduct.stock} 
                                onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Category</label>
                            <select 
                              className="w-full rounded-md border border-brand-dark/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                              value={editingProduct.category}
                              onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}
                            >
                              <option value="rings">Rings</option>
                              <option value="necklaces">Necklaces</option>
                              <option value="earrings">Earrings</option>
                              <option value="bracelets">Bracelets</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Product Label (Tag)</label>
                            <select 
                              className="w-full rounded-md border border-brand-dark/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                              value={editingProduct.label || ''}
                              onChange={e => setEditingProduct({...editingProduct, label: e.target.value})}
                            >
                              <option value="">No Label</option>
                              <option value="Best Seller">Best Seller</option>
                              <option value="New Arrival">New Arrival</option>
                              <option value="Limited Edition">Limited Edition</option>
                              <option value="Trending">Trending</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 rounded-md border border-brand-dark/10 p-3">
                              <input 
                                type="checkbox" 
                                id="isFeatured"
                                checked={editingProduct.isFeatured || false}
                                onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})}
                                className="h-4 w-4 rounded border-brand-dark/20 text-brand-gold focus:ring-brand-gold"
                              />
                              <label htmlFor="isFeatured" className="text-xs font-bold uppercase tracking-widest text-brand-dark/60 cursor-pointer">Featured Product</label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-md border border-brand-dark/10 p-3">
                              <input 
                                type="checkbox" 
                                id="isNew"
                                checked={editingProduct.isNew || false}
                                onChange={e => setEditingProduct({...editingProduct, isNew: e.target.checked})}
                                className="h-4 w-4 rounded border-brand-dark/20 text-brand-gold focus:ring-brand-gold"
                              />
                              <label htmlFor="isNew" className="text-xs font-bold uppercase tracking-widest text-brand-dark/60 cursor-pointer">New Arrival</label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Short Description</label>
                            <Textarea 
                              value={editingProduct.description} 
                              onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                              placeholder="Brief overview of the product..."
                              className="h-24"
                            />
                          </div>

                          <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Product Gallery (Main Images)</label>
                            <div className="grid grid-cols-2 gap-4">
                              {(editingProduct.images || []).map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg border border-brand-dark/10 overflow-hidden bg-brand-paper">
                                  <img src={img} alt="Gallery" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newImages = [...(editingProduct.images || [])];
                                      newImages.splice(idx, 1);
                                      setEditingProduct({...editingProduct, images: newImages});
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-brand-dark/10 hover:border-brand-gold hover:bg-brand-gold/5 transition-all cursor-pointer">
                                <Upload className="h-6 w-6 text-brand-dark/20 mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Upload Image</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleImageUpload(e, 'gallery')}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Info */}
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark/60">
                              <Info className="h-4 w-4" /> About the Product
                            </label>
                            <Textarea 
                              value={editingProduct.about} 
                              onChange={e => setEditingProduct({...editingProduct, about: e.target.value})}
                              placeholder="Detailed story or inspiration behind the piece..."
                              className="h-24"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark/60">
                              <Tag className="h-4 w-4" /> Product Details
                            </label>
                            <Textarea 
                              value={editingProduct.details} 
                              onChange={e => setEditingProduct({...editingProduct, details: e.target.value})}
                              placeholder="Material, weight, dimensions, gemstones..."
                              className="h-24"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark/60">
                              <Truck className="h-4 w-4" /> Shipping & Returns
                            </label>
                            <Textarea 
                              value={editingProduct.shippingReturns} 
                              onChange={e => setEditingProduct({...editingProduct, shippingReturns: e.target.value})}
                              placeholder="Delivery timelines, return policy details..."
                              className="h-24"
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark/60">
                                <Gift className="h-4 w-4" /> Exclusive Offers
                              </label>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const newOffers = [...(editingProduct.offers || [])];
                                  newOffers.push({ title: '', description: '', code: '' });
                                  setEditingProduct({...editingProduct, offers: newOffers});
                                }}
                                className="h-7 text-[10px] uppercase tracking-widest"
                              >
                                <Plus className="mr-1 h-3 w-3" /> Add Offer
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              {(editingProduct.offers || []).map((offer, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-brand-dark/10 bg-brand-paper/30 space-y-3 relative">
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newOffers = [...(editingProduct.offers || [])];
                                      newOffers.splice(idx, 1);
                                      setEditingProduct({...editingProduct, offers: newOffers});
                                    }}
                                    className="absolute top-2 right-2 text-brand-dark/20 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Offer Title</label>
                                      <Input 
                                        placeholder="e.g. EXTRA 15% OFF" 
                                        value={offer.title}
                                        onChange={e => {
                                          const newOffers = [...(editingProduct.offers || [])];
                                          newOffers[idx] = {...offer, title: e.target.value};
                                          setEditingProduct({...editingProduct, offers: newOffers});
                                        }}
                                        className="bg-white h-8 text-xs"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Coupon Code</label>
                                      <Input 
                                        placeholder="e.g. AURA15" 
                                        value={offer.code}
                                        onChange={e => {
                                          const newOffers = [...(editingProduct.offers || [])];
                                          newOffers[idx] = {...offer, code: e.target.value};
                                          setEditingProduct({...editingProduct, offers: newOffers});
                                        }}
                                        className="bg-white h-8 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Description</label>
                                    <Input 
                                      placeholder="e.g. on orders above ₹2999" 
                                      value={offer.description}
                                      onChange={e => {
                                        const newOffers = [...(editingProduct.offers || [])];
                                        newOffers[idx] = {...offer, description: e.target.value};
                                        setEditingProduct({...editingProduct, offers: newOffers});
                                      }}
                                      className="bg-white h-8 text-xs"
                                    />
                                  </div>
                                </div>
                              ))}
                              
                              {(editingProduct.offers || []).length === 0 && (
                                <p className="text-center py-4 text-xs text-brand-dark/40 italic">No exclusive offers added yet.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Variants / Finishes */}
                        <div className="lg:col-span-2 space-y-4">
                          <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Product Variants (3 Finishes)</label>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {(editingProduct.variants || []).map((variant, idx) => (
                              <div key={idx} className="space-y-4 p-6 rounded-2xl border border-brand-dark/10 bg-brand-paper/30">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Finish Name</label>
                                  <Input 
                                    placeholder="e.g. Silver" 
                                    value={variant.name}
                                    onChange={e => {
                                      const newVariants = [...(editingProduct.variants || [])];
                                      newVariants[idx] = {...variant, name: e.target.value};
                                      setEditingProduct({...editingProduct, variants: newVariants});
                                    }}
                                    className="bg-white"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Variant Image</label>
                                  {variant.image ? (
                                    <div className="relative aspect-square rounded-xl overflow-hidden border border-brand-dark/10">
                                      <img src={variant.image} alt={variant.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const newVariants = [...(editingProduct.variants || [])];
                                          newVariants[idx] = {...variant, image: ''};
                                          setEditingProduct({...editingProduct, variants: newVariants});
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                      >
                                        <Trash className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-brand-dark/10 hover:border-brand-gold hover:bg-brand-gold/5 transition-all cursor-pointer bg-white">
                                      <Upload className="h-5 w-5 text-brand-dark/20 mb-2" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Upload Variant Image</span>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => handleImageUpload(e, 'variant', idx)}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-4 lg:col-span-2">
                          <Button type="button" variant="ghost" onClick={() => { setEditingProduct(null); setIsAdding(false); }}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-brand-dark text-white hover:bg-brand-dark/90">
                            <Save className="mr-2 h-4 w-4" /> {isAdding ? 'Create Product' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  /* Product List */
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden border-none bg-white transition-shadow hover:shadow-md shadow-sm">
                        <div className="aspect-square overflow-hidden bg-[#F9F9F9]">
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-sm">{product.name}</h3>
                              <p className="text-xs text-[#616161] capitalize">{product.category}</p>
                            </div>
                            <span className="text-sm font-bold">₹{product.price.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-white" onClick={() => startEditing(product)}>
                              <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                            </Button>
                            {deletingId === product.id ? (
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => handleDelete(product.id)}>
                                  Confirm
                                </Button>
                                <Button variant="outline" size="sm" className="bg-white" onClick={() => setDeletingId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600 bg-white" onClick={() => setDeletingId(product.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
          </div>
        ) : activeTab === 'customers' ? (
        <div className="space-y-8">
          <Card className="border-brand-dark/5 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl font-serif">Checkout Customers</CardTitle>
                <CardDescription>Customers who have actually purchased products.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToCSV(checkoutCustomers, 'checkout_customers')}
                  className="bg-white"
                >
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToJSON(checkoutCustomers, 'checkout_customers')}
                  className="bg-white"
                >
                  <Download className="mr-2 h-4 w-4" /> JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
                </div>
              ) : checkoutCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-brand-dark/60">No checkout customers yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-brand-paper/50 text-brand-dark/60">
                      <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Phone</th>
                        <th className="px-6 py-3 text-right">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkoutCustomers.map((c, idx) => (
                        <tr key={idx} className="border-b border-brand-dark/5">
                          <td className="px-6 py-4 font-medium">{c.name}</td>
                          <td className="px-6 py-4">{c.email}</td>
                          <td className="px-6 py-4">{c.phone}</td>
                          <td className="px-6 py-4 text-right font-bold text-brand-gold">₹{c.totalSpent.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-brand-dark/5 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl font-serif">Registered Users</CardTitle>
                <CardDescription>Users who have signed up for an account.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToCSV(users, 'registered_users')}
                  className="bg-white"
                >
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToJSON(users, 'registered_users')}
                  className="bg-white"
                >
                  <Download className="mr-2 h-4 w-4" /> JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-brand-dark/60">No users registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-brand-paper/50 text-brand-dark/60">
                      <tr>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-brand-dark/5">
                          <td className="px-6 py-4 font-medium">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", u.role === 'admin' ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-dark/5 text-brand-dark/60")}>
                              {u.role || 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-brand-dark/60">
                            {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-brand-dark/5 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl font-serif">Newsletter Subscribers</CardTitle>
                <CardDescription>Users who have subscribed to the newsletter.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToCSV(subscribers, 'newsletter_subscribers')}
                  className="bg-white"
                >
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToJSON(subscribers, 'newsletter_subscribers')}
                  className="bg-white"
                >
                  <Download className="mr-2 h-4 w-4" /> JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscribersLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-brand-dark/60">No subscribers yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-brand-paper/50 text-brand-dark/60">
                      <tr>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Subscribed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((s) => (
                        <tr key={s.id} className="border-b border-brand-dark/5">
                          <td className="px-6 py-4 font-medium">{s.email}</td>
                          <td className="px-6 py-4 text-brand-dark/60">
                            {s.subscribedAt?.seconds ? new Date(s.subscribedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orders</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportToCSV(orders, 'orders')}
                className="bg-white"
              >
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportToJSON(orders, 'orders')}
                className="bg-white"
              >
                <Download className="mr-2 h-4 w-4" /> JSON
              </Button>
            </div>
          </div>
          {ordersLoading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-brand-dark/5">
              <Package className="h-12 w-12 mx-auto text-brand-dark/20 mb-4" />
              <h3 className="text-xl font-medium">No orders yet</h3>
              <p className="text-brand-dark/60">When customers place orders, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="border-brand-dark/5 bg-white">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Order #{order.id.slice(-6)}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            order.status === 'pending' ? "bg-yellow-100 text-yellow-700" : 
                            order.status === 'paid' ? "bg-green-100 text-green-700" : 
                            order.status === 'completed' ? "bg-blue-100 text-blue-700" :
                            order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                            "bg-orange-100 text-orange-700"
                          )}>
                            {order.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-dark/5 text-brand-dark/60">
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                             order.paymentMethod === 'stripe' ? 'Stripe Gateway' :
                             order.paymentMethod === 'wise' ? 'Wise Transfer' : 'Razorpay Gateway'}
                          </span>
                        </div>
                        <h3 className="text-xl font-medium">{order.customerName}</h3>
                        <p className="text-sm text-brand-dark/60">{order.email} • {order.phone}</p>
                        <p className="text-sm text-brand-dark/60">{order.address}, {order.city} - {order.pincode}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-4">
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Total Amount</p>
                          <p className="text-2xl font-bold text-brand-gold">₹{order.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white text-green-600 border-green-200 hover:bg-green-50"
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'orders', order.id), { status: 'completed' });
                                toast.success('Order marked as completed');
                              } catch (error) {
                                toast.error('Failed to update order');
                              }
                            }}
                            disabled={order.status === 'completed' || order.status === 'cancelled'}
                          >
                            Complete
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'orders', order.id), { status: 'cancelled' });
                                await sendOrderNotification(order, 'cancelled');
                                toast.success('Order cancelled and customer notified');
                              } catch (error) {
                                toast.error('Failed to cancel order');
                              }
                            }}
                            disabled={order.status === 'completed' || order.status === 'cancelled'}
                          >
                            Cancel
                          </Button>
                          {(['online', 'stripe', 'wise'].includes(order.paymentMethod)) && (order.status === 'pending' || order.status === 'awaiting_payment') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-white text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'orders', order.id), { status: 'failed' });
                                  await sendOrderNotification(order, 'failed');
                                  toast.success('Order marked as failed and customer notified');
                                } catch (error) {
                                  toast.error('Failed to update order');
                                }
                              }}
                            >
                              Fail
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4 bg-brand-dark/5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 mb-2">Items</p>
                      <div className="space-y-1">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
            ) : activeTab === 'marketing' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Marketing</h1>
                </div>
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Authentication Settings</CardTitle>
                    <CardDescription>Configure how your customers log in to Aura Jewelry.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Email Auth Section */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-xl bg-[#F9F9F9] border border-[#E3E3E3]">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-[#EC7B8F] rounded flex items-center justify-center text-white">
                            <Mail className="h-5 w-5" />
                          </div>
                          <h3 className="text-lg font-bold">Email & Password Login</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            authSettings.emailEnabled ? "bg-green-100 text-green-700" : "bg-[#E3E3E3] text-[#616161]"
                          )}>
                            {authSettings.emailEnabled ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-sm text-[#616161] max-w-xl">
                          Allow users to log in using their email address and password. This includes mandatory email verification for new accounts.
                        </p>
                        <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                          <p className="text-[10px] text-blue-800 leading-relaxed">
                            <strong>Note:</strong> To use Email Auth, you must enable "Email/Password" as a sign-in provider in your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold">Firebase Console</a>.
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => saveAuthSettings({...authSettings, emailEnabled: !authSettings.emailEnabled})}
                        className={cn(
                          "w-full md:w-auto",
                          authSettings.emailEnabled ? "bg-red-500 hover:bg-red-600 text-white" : "bg-brand-dark text-white hover:bg-brand-dark/90"
                        )}
                      >
                        {authSettings.emailEnabled ? "Deactivate" : "Activate"}
                      </Button>
                    </div>

                    {/* Social Login Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button 
                        onClick={() => saveAuthSettings({...authSettings, googleEnabled: !authSettings.googleEnabled})}
                        className={cn(
                          "p-6 rounded-xl border transition-all text-left group",
                          authSettings.googleEnabled ? "bg-white border-[#E3E3E3]" : "bg-[#F9F9F9] border-[#E3E3E3] opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                          <h4 className="font-bold">Google Login</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            authSettings.googleEnabled ? "bg-green-100 text-green-700" : "bg-[#E3E3E3] text-[#616161]"
                          )}>
                            {authSettings.googleEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-xs text-[#616161]">One-tap login using Google accounts. Fully configured and active.</p>
                      </button>

                      <button 
                        onClick={() => saveAuthSettings({...authSettings, whatsappEnabled: !authSettings.whatsappEnabled})}
                        className={cn(
                          "p-6 rounded-xl border transition-all text-left group",
                          authSettings.whatsappEnabled ? "bg-white border-[#E3E3E3]" : "bg-[#F9F9F9] border-[#E3E3E3] opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <MessageCircle className="h-5 w-5 text-[#25D366]" />
                          <h4 className="font-bold">WhatsApp Login</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            authSettings.whatsappEnabled ? "bg-green-100 text-green-700" : "bg-[#E3E3E3] text-[#616161]"
                          )}>
                            {authSettings.whatsappEnabled ? "Enabled" : "Coming Soon"}
                          </span>
                        </div>
                        <p className="text-xs text-[#616161]">Direct login via WhatsApp message. Currently in development phase.</p>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Login Customization</CardTitle>
                    <CardDescription>Update the text and links shown in the login modal.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#616161]">Privacy Policy URL</label>
                        <Input 
                          value={authSettings.privacyPolicyUrl} 
                          onChange={e => setAuthSettings({...authSettings, privacyPolicyUrl: e.target.value})}
                          className="bg-[#F9F9F9]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#616161]">Terms & Conditions URL</label>
                        <Input 
                          value={authSettings.termsUrl} 
                          onChange={e => setAuthSettings({...authSettings, termsUrl: e.target.value})}
                          className="bg-[#F9F9F9]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#616161]">Support Email</label>
                        <Input 
                          value={authSettings.supportEmail} 
                          onChange={e => setAuthSettings({...authSettings, supportEmail: e.target.value})}
                          className="bg-[#F9F9F9]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#616161]">WhatsApp Business Number</label>
                        <Input 
                          value={authSettings.whatsappNumber} 
                          onChange={e => setAuthSettings({...authSettings, whatsappNumber: e.target.value})}
                          className="bg-[#F9F9F9]" 
                          placeholder="+91..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => saveAuthSettings(authSettings)}
                        className="bg-brand-gold text-white hover:bg-brand-gold/90"
                      >
                        Update Marketing UI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : activeTab === 'notifications' ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Email Notifications</h1>
              <Button variant="outline" size="sm" className="bg-white" onClick={handleTestEmail}>Test Email</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <Card className="border-brand-dark/5 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">Order Confirmation</CardTitle>
                    <CardDescription>Configure the email sent to customers after placing an order.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className={cn(
                      "flex items-center justify-between p-4 rounded-xl border",
                      notificationSettings.orderConfirmation.enabled ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-white",
                          notificationSettings.orderConfirmation.enabled ? "bg-green-500" : "bg-gray-400"
                        )}>
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className={cn("font-bold", notificationSettings.orderConfirmation.enabled ? "text-green-800" : "text-gray-800")}>
                            Status: {notificationSettings.orderConfirmation.enabled ? 'Active' : 'Disabled'}
                          </p>
                          <p className={cn("text-xs", notificationSettings.orderConfirmation.enabled ? "text-green-600" : "text-gray-600")}>
                            {notificationSettings.orderConfirmation.enabled ? 'Emails are being sent successfully.' : 'Emails are currently paused.'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          orderConfirmation: { ...notificationSettings.orderConfirmation, enabled: !notificationSettings.orderConfirmation.enabled }
                        })}
                      >
                        {notificationSettings.orderConfirmation.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Email Subject</label>
                        <Input 
                          value={notificationSettings.orderConfirmation.subject} 
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            orderConfirmation: { ...notificationSettings.orderConfirmation, subject: e.target.value }
                          })}
                          className="bg-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Sender Name</label>
                        <Input 
                          value={notificationSettings.orderConfirmation.senderName} 
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            orderConfirmation: { ...notificationSettings.orderConfirmation, senderName: e.target.value }
                          })}
                          className="bg-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Reply-to Email</label>
                        <Input 
                          value={notificationSettings.orderConfirmation.replyTo} 
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            orderConfirmation: { ...notificationSettings.orderConfirmation, replyTo: e.target.value }
                          })}
                          className="bg-white" 
                        />
                      </div>
                    </div>

                    <Button onClick={saveNotificationSettings} className="w-full bg-brand-dark text-white rounded-xl py-6">Save Template</Button>
                  </CardContent>
                </Card>

                <Card className="border-brand-dark/5 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">Order Cancelled</CardTitle>
                    <CardDescription>Email sent when an order is cancelled by admin.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Email Subject</label>
                        <Input 
                          value={notificationSettings.orderCancelled.subject} 
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            orderCancelled: { ...notificationSettings.orderCancelled, subject: e.target.value }
                          })}
                          className="bg-white" 
                        />
                      </div>
                      <Button onClick={saveNotificationSettings} className="w-full bg-brand-dark text-white rounded-xl py-6">Save Template</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-brand-dark/5 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">Payment Failed</CardTitle>
                    <CardDescription>Email sent when an online payment fails.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Email Subject</label>
                        <Input 
                          value={notificationSettings.orderFailed.subject} 
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            orderFailed: { ...notificationSettings.orderFailed, subject: e.target.value }
                          })}
                          className="bg-white" 
                        />
                      </div>
                      <Button onClick={saveNotificationSettings} className="w-full bg-brand-dark text-white rounded-xl py-6">Save Template</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-brand-dark/5 bg-white h-fit">
                <CardHeader>
                  <CardTitle className="text-xl font-serif">SMTP Configuration</CardTitle>
                  <CardDescription>Settings for your email delivery service.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/10">
                    <p className="text-xs text-brand-gold font-medium leading-relaxed">
                      <strong>Note:</strong> SMTP credentials should be set as environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) for security. If not set, the system will log emails to the server console for debugging.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">SMTP Host</label>
                      <Input 
                        value={smtpSettings.host} 
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                        placeholder="smtp.gmail.com" 
                        className="bg-white" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">SMTP Port</label>
                        <Input 
                          value={smtpSettings.port} 
                          onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                          placeholder="587" 
                          className="bg-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Encryption</label>
                        <select 
                          value={smtpSettings.encryption}
                          onChange={(e) => setSmtpSettings({ ...smtpSettings, encryption: e.target.value })}
                          className="w-full h-10 rounded-md border border-brand-dark/10 bg-white px-3 py-2 text-sm focus:border-brand-gold focus:outline-none"
                        >
                          <option>STARTTLS</option>
                          <option>SSL/TLS</option>
                          <option>None</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">SMTP Username</label>
                      <Input 
                        value={smtpSettings.username} 
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })}
                        placeholder="user@example.com" 
                        className="bg-white" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">SMTP Password / App Password</label>
                      <Input 
                        type="password"
                        value={smtpSettings.password} 
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                        placeholder="••••••••••••••••" 
                        className="bg-white" 
                      />
                      <p className="text-[10px] text-brand-dark/40 mt-1">
                        For Gmail, use a 16-character <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">App Password</a>.
                      </p>
                    </div>
                  </div>

                  <Button onClick={saveSmtpSettings} variant="outline" className="w-full border-brand-dark/10 rounded-xl py-6">Update Credentials</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeTab === 'discounts' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Discounts</h1>
                  <Button className="bg-brand-dark text-white hover:bg-brand-dark/90">
                    <Plus className="mr-2 h-4 w-4" /> Create discount
                  </Button>
                </div>
                <div className="bg-white p-12 rounded-xl border border-[#E3E3E3] text-center">
                  <Ticket className="h-12 w-12 mx-auto text-[#616161] mb-4" />
                  <h3 className="text-lg font-bold">Manage discounts and promotions</h3>
                  <p className="text-[#616161] max-w-md mx-auto mt-2">Create discount codes and automatic discounts to increase sales and reward loyal customers.</p>
                </div>
              </div>
            ) : activeTab === 'analytics' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Analytics</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-white border-none shadow-sm h-64 flex items-center justify-center">
                    <p className="text-[#616161] text-sm">Sales over time chart</p>
                  </Card>
                  <Card className="bg-white border-none shadow-sm h-64 flex items-center justify-center">
                    <p className="text-[#616161] text-sm">Conversion rate chart</p>
                  </Card>
                  <Card className="bg-white border-none shadow-sm h-64 flex items-center justify-center">
                    <p className="text-[#616161] text-sm">Average order value chart</p>
                  </Card>
                </div>
              </div>
            ) : activeTab === 'settings' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Settings</h1>
                </div>
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Payment Integrations</CardTitle>
                    <CardDescription>Manage your payment gateways and transaction settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Razorpay Section */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-xl bg-[#F9F9F9] border border-[#E3E3E3]">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-8" referrerPolicy="no-referrer" />
                          <h3 className="text-lg font-bold">Razorpay</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            razorpaySettings.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {razorpaySettings.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-[#616161] max-w-xl">
                          Razorpay is India's leading payments solution. It allows you to accept payments via UPI, Credit/Debit Cards, Netbanking, and Wallets.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0">
                        <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                          <Button variant="outline" className="w-full bg-white">
                            Get API Keys
                          </Button>
                        </a>
                        <Button 
                          onClick={() => setIsRazorpayConfigOpen(true)}
                          className="bg-brand-dark text-white hover:bg-brand-dark/90 w-full md:w-auto"
                        >
                          Configure
                        </Button>
                      </div>
                    </div>

                    {/* Razorpay Config Modal Overlay */}
                    {isRazorpayConfigOpen && (
                      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <Card className="w-full max-w-md bg-white border-none shadow-2xl">
                          <CardHeader className="relative">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute right-4 top-4 rounded-full"
                              onClick={() => setIsRazorpayConfigOpen(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-3 mb-2">
                              <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6" referrerPolicy="no-referrer" />
                              <CardTitle className="text-xl">Razorpay Settings</CardTitle>
                            </div>
                            <CardDescription>Enter your Razorpay API credentials to enable online payments.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Key ID</label>
                                <Input 
                                  value={razorpaySettings.keyId}
                                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keyId: e.target.value })}
                                  placeholder="rzp_test_..." 
                                  className="bg-white" 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Key Secret</label>
                                <Input 
                                  type="password"
                                  value={razorpaySettings.keySecret}
                                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keySecret: e.target.value })}
                                  placeholder="••••••••••••••••" 
                                  className="bg-white" 
                                />
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                <input 
                                  type="checkbox" 
                                  id="razorpay-enabled"
                                  checked={razorpaySettings.enabled}
                                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, enabled: e.target.checked })}
                                  className="rounded border-brand-dark/20 text-brand-gold focus:ring-brand-gold h-4 w-4"
                                />
                                <label htmlFor="razorpay-enabled" className="text-sm font-medium">Enable Razorpay Payments</label>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button 
                                variant="outline" 
                                className="flex-1" 
                                onClick={() => setIsRazorpayConfigOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                className="flex-1 bg-brand-dark text-white hover:bg-brand-dark/90"
                                onClick={saveRazorpaySettings}
                              >
                                Save Config
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Stripe Section */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-xl bg-white border border-[#E3E3E3]">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-[#635BFF] rounded flex items-center justify-center text-white font-bold text-xl">S</div>
                          <h3 className="text-lg font-bold">Stripe</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            stripeSettings.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {stripeSettings.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-[#616161] max-w-xl">
                          Accept international payments easily with Stripe. Support for Apple Pay, Google Pay, and global currencies.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0">
                        <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                          <Button variant="outline" className="w-full bg-white">
                            Get API Keys
                          </Button>
                        </a>
                        <Button 
                          onClick={() => setIsStripeConfigOpen(true)}
                          className="bg-[#635BFF] text-white hover:bg-[#635BFF]/90 w-full md:w-auto border-none"
                        >
                          Configure
                        </Button>
                      </div>
                    </div>

                    {/* Stripe Config Modal Overlay */}
                    {isStripeConfigOpen && (
                      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <Card className="w-full max-w-md bg-white border-none shadow-2xl">
                          <CardHeader className="relative">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute right-4 top-4 rounded-full"
                              onClick={() => setIsStripeConfigOpen(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-6 w-6 bg-[#635BFF] rounded flex items-center justify-center text-white font-bold text-sm">S</div>
                              <CardTitle className="text-xl">Stripe Settings</CardTitle>
                            </div>
                            <CardDescription>Enter your Stripe API credentials to enable global payments.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Publishable Key</label>
                                <Input 
                                  value={stripeSettings.publishableKey}
                                  onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
                                  placeholder="pk_test_..." 
                                  className="bg-white" 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Secret Key</label>
                                <Input 
                                  type="password"
                                  value={stripeSettings.secretKey}
                                  onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
                                  placeholder="sk_test_..." 
                                  className="bg-white" 
                                />
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                <input 
                                  type="checkbox" 
                                  id="stripe-enabled"
                                  checked={stripeSettings.enabled}
                                  onChange={(e) => setStripeSettings({ ...stripeSettings, enabled: e.target.checked })}
                                  className="rounded border-brand-dark/20 text-[#635BFF] focus:ring-[#635BFF] h-4 w-4"
                                />
                                <label htmlFor="stripe-enabled" className="text-sm font-medium">Enable Stripe Payments</label>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button 
                                variant="outline" 
                                className="flex-1" 
                                onClick={() => setIsStripeConfigOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                className="flex-1 bg-[#635BFF] text-white hover:bg-[#635BFF]/90 border-none"
                                onClick={saveStripeSettings}
                              >
                                Save Config
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Wise Section */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-xl bg-white border border-[#E3E3E3]">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-[#00B9FF] rounded flex items-center justify-center text-white font-bold text-xl">W</div>
                          <h3 className="text-lg font-bold">Wise</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            wiseSettings.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {wiseSettings.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-[#616161] max-w-xl">
                          Accept international bank transfers via Wise. Customers will see your bank details to complete the payment manually.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0">
                        <Button 
                          onClick={() => setIsWiseConfigOpen(true)}
                          className="bg-[#00B9FF] text-white hover:bg-[#00B9FF]/90 w-full md:w-auto border-none"
                        >
                          Configure
                        </Button>
                      </div>
                    </div>

                    {/* Cash on Delivery Section */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-xl bg-white border border-[#E3E3E3]">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <Truck className="h-8 w-8 text-brand-gold" />
                          <h3 className="text-lg font-bold">Cash on Delivery</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            codSettings.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {codSettings.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-[#616161] max-w-xl">
                          Allow customers to pay in cash when they receive the product.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-dark/60">{codSettings.enabled ? 'Enabled' : 'Disabled'}</span>
                        <div 
                          onClick={() => saveCodSettings(!codSettings.enabled)}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2",
                            codSettings.enabled ? "bg-brand-gold" : "bg-gray-200"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                              codSettings.enabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Wise Config Modal Overlay */}
                    {isWiseConfigOpen && (
                      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <Card className="w-full max-w-md bg-white border-none shadow-2xl">
                          <CardHeader className="relative">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute right-4 top-4 rounded-full"
                              onClick={() => setIsWiseConfigOpen(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-6 w-6 bg-[#00B9FF] rounded flex items-center justify-center text-white font-bold text-sm">W</div>
                              <CardTitle className="text-xl">Wise Settings</CardTitle>
                            </div>
                            <CardDescription>Enter your Wise bank details for customers to transfer funds.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Account Holder Name</label>
                                <Input 
                                  value={wiseSettings.accountHolder}
                                  onChange={(e) => setWiseSettings({ ...wiseSettings, accountHolder: e.target.value })}
                                  placeholder="John Doe" 
                                  className="bg-white" 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">IBAN / Account Number</label>
                                <Input 
                                  value={wiseSettings.accountNumber}
                                  onChange={(e) => setWiseSettings({ ...wiseSettings, accountNumber: e.target.value })}
                                  placeholder="GBxx xxxx xxxx xxxx" 
                                  className="bg-white" 
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Currency</label>
                                  <Input 
                                    value={wiseSettings.currency}
                                    onChange={(e) => setWiseSettings({ ...wiseSettings, currency: e.target.value.toUpperCase() })}
                                    placeholder="USD" 
                                    className="bg-white" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">SWIFT / BIC</label>
                                  <Input 
                                    value={wiseSettings.swiftBic}
                                    onChange={(e) => setWiseSettings({ ...wiseSettings, swiftBic: e.target.value.toUpperCase() })}
                                    placeholder="WISEXXXX" 
                                    className="bg-white" 
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                <input 
                                  type="checkbox" 
                                  id="wise-enabled"
                                  checked={wiseSettings.enabled}
                                  onChange={(e) => setWiseSettings({ ...wiseSettings, enabled: e.target.checked })}
                                  className="rounded border-brand-dark/20 text-[#00B9FF] focus:ring-[#00B9FF] h-4 w-4"
                                />
                                <label htmlFor="wise-enabled" className="text-sm font-medium">Enable Wise Payments</label>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button 
                                variant="outline" 
                                className="flex-1" 
                                onClick={() => setIsWiseConfigOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                className="flex-1 bg-[#00B9FF] text-white hover:bg-[#00B9FF]/90 border-none"
                                onClick={saveWiseSettings}
                              >
                                Save Config
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Checkout Verification Settings */}
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Checkout Verification</CardTitle>
                    <CardDescription>Configure security and verification steps required during customer checkout.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-[#F9F9F9] border border-[#E3E3E3]">
                      <div className="space-y-1">
                        <h4 className="font-bold">Email Verification (OTP)</h4>
                        <p className="text-sm text-[#616161]">Require customers to verify their email address before placing an order.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">
                          {checkoutSettings.emailVerificationEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <div 
                          onClick={() => saveCheckoutSettings('emailVerificationEnabled', !checkoutSettings.emailVerificationEnabled)}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2",
                            checkoutSettings.emailVerificationEnabled ? "bg-brand-gold" : "bg-gray-200"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                              checkoutSettings.emailVerificationEnabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-[#F9F9F9] border border-[#E3E3E3]">
                      <div className="space-y-1">
                        <h4 className="font-bold">Phone Verification (OTP)</h4>
                        <p className="text-sm text-[#616161]">Require customers to verify their phone number via SMS/OTP before placing an order.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">
                          {checkoutSettings.phoneVerificationEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <div 
                          onClick={() => saveCheckoutSettings('phoneVerificationEnabled', !checkoutSettings.phoneVerificationEnabled)}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2",
                            checkoutSettings.phoneVerificationEnabled ? "bg-brand-gold" : "bg-gray-200"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                              checkoutSettings.phoneVerificationEnabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-[#616161]">Tab content coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
