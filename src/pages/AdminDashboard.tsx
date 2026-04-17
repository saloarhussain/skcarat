import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Home, ShoppingBag, Package, Users, Megaphone, Ticket, BarChart, Settings, Search, Bell, User, ChevronDown, ChevronRight, Plus, Edit, Trash2, Save, X, Image as ImageIcon, Tag, Info, Truck, Gift, MessageCircle, Mail, Upload, Trash, ExternalLink, Menu, Download, CheckCircle2, CreditCard, ShoppingCart, Key, Film, Layers, Monitor, Globe, Layout, Eye, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [isOnlineStoreExpanded, setIsOnlineStoreExpanded] = useState(true);
  
  type Tab = 'home' | 'orders' | 'products' | 'collections' | 'reels' | 'customers' | 'authentication' | 'notifications' | 'discounts' | 'analytics' | 'payment' | 'checkout' | 'settings' | 'online_store';
  const [activeTab, setActiveTab] = useState<Tab>('home');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [isAddingReel, setIsAddingReel] = useState(false);
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    image: '',
    productIds: [] as string[]
  });
  const [isAddingBlogPost, setIsAddingBlogPost] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<any>(null);
  const [blogPostForm, setBlogPostForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    author: '',
    tags: [] as string[]
  });

  const [onlineStoreTab, setOnlineStoreTab] = useState<'themes' | 'blog' | 'pages'>('blog');
  const [pages, setPages] = useState<any[]>([]);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    content: ''
  });
  const [themeConfig, setThemeConfig] = useState<any>({
    primaryColor: '#CE9F43',
    secondaryColor: '#303030',
    announcements: ['Free shipping on all orders above ₹2999'],
    showAnnouncementBar: true,
    heroTitle: 'Exquisite Aura for Every Occasion',
    heroSubtitle: 'Handcrafted luxury jewelry designed to elevate your style.',
    fontFamily: 'Inter'
  });

  const [isSavingReel, setIsSavingReel] = useState(false);
  const [editingReel, setEditingReel] = useState<any>(null);
  const [reelForm, setReelForm] = useState({
    videoUrl: '',
    embedCode: '',
    productId: '',
    caption: '',
    thumbnail: ''
  });
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
      console.error("Products listener error:", error);
      handleFirestoreError(error, OperationType.LIST, 'products');
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
      console.error("Orders listener error:", error);
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setOrdersLoading(false);
    });

    // Real-time listener for Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setUsersLoading(false);
    }, (error) => {
      console.error("Users listener error:", error);
      handleFirestoreError(error, OperationType.LIST, 'users');
      setUsersLoading(false);
    });

    // Real-time listener for Subscribers
    const unsubscribeSubscribers = onSnapshot(collection(db, 'subscribers'), (snapshot) => {
      const subscribersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscribers(subscribersData);
      setSubscribersLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'subscribers');
      setSubscribersLoading(false);
    });

    // Real-time listener for Reels
    const unsubscribeReels = onSnapshot(query(collection(db, 'reels'), orderBy('createdAt', 'desc')), (snapshot) => {
      const reelsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReels(reelsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reels');
    });

    // Real-time listener for Collections
    const unsubscribeCollections = onSnapshot(query(collection(db, 'collections'), orderBy('createdAt', 'desc')), (snapshot) => {
      const collectionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCollections(collectionsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'collections');
    });

    // Real-time listener for Blog Posts
    const unsubscribeBlog = onSnapshot(collection(db, 'blog'), (snapshot) => {
      const blogData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlogPosts(blogData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blog');
    });

    // Real-time listener for Pages
    const unsubscribePages = onSnapshot(collection(db, 'pages'), (snapshot) => {
      const pagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPages(pagesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pages');
    });

    // Real-time listener for Theme Config
    const unsubscribeTheme = onSnapshot(doc(db, 'settings', 'theme_config'), (snapshot) => {
      if (snapshot.exists()) {
        setThemeConfig(snapshot.data() as any);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeSubscribers();
      unsubscribeReels();
      unsubscribeCollections();
      unsubscribeBlog();
      unsubscribePages();
      unsubscribeTheme();
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
  
  const [isTrustpilotConfigOpen, setIsTrustpilotConfigOpen] = useState(false);
  const [trustpilotSettings, setTrustpilotSettings] = useState({
    businessUnitId: '',
    templateId: '',
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

        // Trustpilot Settings
        const trustpilotDoc = await getDoc(doc(db, 'settings', 'trustpilot_config'));
        if (trustpilotDoc.exists()) setTrustpilotSettings(trustpilotDoc.data() as any);

        // Checkout Settings
        const checkoutDoc = await getDoc(doc(db, 'settings', 'checkout'));
        if (checkoutDoc.exists()) setCheckoutSettings(checkoutDoc.data() as any);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings');
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
      handleFirestoreError(error, OperationType.WRITE, 'settings');
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
      handleFirestoreError(error, OperationType.WRITE, 'settings');
    }
  };

  const saveStripeSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'stripe_config'), stripeSettings);
      toast.success('Stripe configuration saved');
      setIsStripeConfigOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings');
    }
  };

  const saveTrustpilotSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'trustpilot_config'), trustpilotSettings);
      toast.success('Trustpilot configuration saved');
      setIsTrustpilotConfigOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings');
    }
  };

  const saveWiseSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'wise_config'), wiseSettings);
      toast.success('Wise configuration saved');
      setIsWiseConfigOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings');
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
          variants: editingProduct.variants || [],
          features: editingProduct.features || []
        });
        toast.success('Product added successfully');
      }
      setEditingProduct(null);
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'products');
    }
  };

  const handleSaveReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingReel) return;
    
    setIsSavingReel(true);
    try {
      if (!reelForm.videoUrl && !reelForm.embedCode) {
        toast.error('Please provide either a Video URL or an Embed Code');
        setIsSavingReel(false);
        return;
      }
      console.log('Saving reel...', reelForm);
      if (editingReel) {
        await updateDoc(doc(db, 'reels', editingReel.id), reelForm);
        toast.success('Reel updated successfully');
      } else {
        await addDoc(collection(db, 'reels'), {
          ...reelForm,
          createdAt: serverTimestamp()
        });
        toast.success('Reel added successfully');
      }
      setIsAddingReel(false);
      setEditingReel(null);
      setReelForm({ videoUrl: '', embedCode: '', productId: '', caption: '', thumbnail: '' });
    } catch (error) {
      handleFirestoreError(error, editingReel ? OperationType.UPDATE : OperationType.CREATE, 'reels');
    } finally {
      setIsSavingReel(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) return;
    try {
      await deleteDoc(doc(db, 'reels', id));
      toast.success('Reel deleted successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'reels');
    }
  };

  const startEditingReel = (reel: any) => {
    setEditingReel(reel);
    setReelForm({
      videoUrl: reel.videoUrl || '',
      embedCode: reel.embedCode || '',
      productId: reel.productId,
      caption: reel.caption || '',
      thumbnail: reel.thumbnail || ''
    });
    setIsAddingReel(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startAddingReel = () => {
    setEditingReel(null);
    setReelForm({ videoUrl: '', embedCode: '', productId: '', caption: '', thumbnail: '' });
    setIsAddingReel(true);
  };

  const startAddingCollection = () => {
    setEditingCollection(null);
    setCollectionForm({ name: '', description: '', image: '', productIds: [] });
    setIsAddingCollection(true);
  };

  const startEditingCollection = (coll: any) => {
    setEditingCollection(coll);
    setCollectionForm({
      name: coll.name,
      description: coll.description,
      image: coll.image || '',
      productIds: coll.productIds || []
    });
    setIsAddingCollection(true);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCollection) {
        await updateDoc(doc(db, 'collections', editingCollection.id), collectionForm);
        toast.success('Collection updated successfully');
      } else {
        await addDoc(collection(db, 'collections'), {
          ...collectionForm,
          createdAt: serverTimestamp()
        });
        toast.success('Collection added successfully');
      }
      setIsAddingCollection(false);
      setEditingCollection(null);
      setCollectionForm({ name: '', description: '', image: '', productIds: [] });
    } catch (error) {
      handleFirestoreError(error, editingCollection ? OperationType.UPDATE : OperationType.CREATE, 'collections');
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      await deleteDoc(doc(db, 'collections', id));
      toast.success('Collection deleted successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'collections');
    }
  };

  const startAddingBlogPost = () => {
    setEditingBlogPost(null);
    setBlogPostForm({ title: '', excerpt: '', content: '', image: '', author: '', tags: [] });
    setIsAddingBlogPost(true);
  };

  const startEditingBlogPost = (post: any) => {
    setEditingBlogPost(post);
    setBlogPostForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image || '',
      author: post.author || '',
      tags: post.tags || []
    });
    setIsAddingBlogPost(true);
  };

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlogPost) {
        await updateDoc(doc(db, 'blog', editingBlogPost.id), blogPostForm);
        toast.success('Blog post updated successfully');
      } else {
        await addDoc(collection(db, 'blog'), {
          ...blogPostForm,
          date: new Date().toLocaleDateString(),
          createdAt: serverTimestamp()
        });
        toast.success('Blog post added successfully');
      }
      setIsAddingBlogPost(false);
      setEditingBlogPost(null);
      setBlogPostForm({ title: '', excerpt: '', content: '', image: '', author: '', tags: [] });
    } catch (error) {
      handleFirestoreError(error, editingBlogPost ? OperationType.UPDATE : OperationType.CREATE, 'blog');
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await deleteDoc(doc(db, 'blog', id));
      toast.success('Blog post deleted successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'blog');
    }
  };

  // Pages Handlers
  const startAddingPage = () => {
    setEditingPage(null);
    setPageForm({ title: '', slug: '', content: '' });
    setIsAddingPage(true);
  };

  const startEditingPage = (page: any) => {
    setEditingPage(page);
    setPageForm({ title: page.title, slug: page.slug, content: page.content });
    setIsAddingPage(true);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPage) {
        await updateDoc(doc(db, 'pages', editingPage.id), pageForm);
        toast.success('Page updated successfully');
      } else {
        await addDoc(collection(db, 'pages'), {
          ...pageForm,
          isVisible: true,
          createdAt: new Date().toISOString()
        });
        toast.success('Page created successfully');
      }
      setIsAddingPage(false);
      setEditingPage(null);
    } catch (error) {
      handleFirestoreError(error, editingPage ? OperationType.UPDATE : OperationType.CREATE, 'pages');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await deleteDoc(doc(db, 'pages', id));
      toast.success('Page deleted successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'pages');
    }
  };

  // Theme Handlers
  const handleSaveTheme = async () => {
    try {
      await setDoc(doc(db, 'settings', 'theme_config'), themeConfig);
      toast.success('Theme settings saved successfully');
    } catch (error: any) {
      toast.error('Error saving theme: ' + error.message);
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
      features: ['15_day_return', 'lifetime_plating', '6_month_warranty', 'fine_material'],
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
    { id: 'collections', label: 'Collections', icon: Layers },
    { id: 'reels', label: 'Instagram Reels', icon: Film },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'discounts', label: 'Discounts', icon: Ticket },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'checkout', label: 'Checkout', icon: ShoppingCart },
    { id: 'online_store', label: 'Online Store', icon: Monitor },
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
          {sidebarItems.map((item) => {
            if (item.id === 'products') {
              const isActive = activeTab === 'products' || activeTab === 'collections';
              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-white text-[#303030] shadow-sm" 
                        : "text-[#616161] hover:bg-[#E3E3E3] hover:text-[#303030]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5", isActive ? "text-brand-dark" : "text-[#616161]")} />
                      {item.label}
                    </div>
                    {isProductsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  
                  {isProductsExpanded && (
                    <div className="ml-4 pl-4 border-l border-[#D1D1D1] space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('products');
                          setEditingProduct(null);
                          setIsAdding(false);
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          activeTab === 'products'
                            ? "bg-white/50 text-brand-dark font-bold"
                            : "text-[#616161] hover:bg-[#E3E3E3]"
                        )}
                      >
                        <Package className="h-4 w-4" />
                        All Products
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('collections');
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          activeTab === 'collections'
                            ? "bg-white/50 text-brand-dark font-bold"
                            : "text-[#616161] hover:bg-[#E3E3E3]"
                        )}
                      >
                        <Layers className="h-4 w-4" />
                        Collections
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (item.id === 'online_store') {
              const isActive = activeTab === 'online_store';
              return (
                <div key={item.id} className="space-y-0.5">
                  <div className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-colors group",
                    isActive 
                      ? "bg-white text-[#303030] shadow-sm" 
                      : "text-[#616161] hover:bg-[#E3E3E3] hover:text-[#303030]"
                  )}>
                    <button
                      type="button"
                      onClick={() => setIsOnlineStoreExpanded(!isOnlineStoreExpanded)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-brand-dark" : "text-[#616161]")} />
                      {item.label}
                    </button>
                    <a 
                      href="/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-[#D1D1D1] text-[#616161] hover:text-[#303030] transition-colors"
                      title="View your store"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </div>
                  
                  {isOnlineStoreExpanded && (
                    <div className="ml-4 pl-4 border-l border-[#D1D1D1] space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('online_store');
                          setOnlineStoreTab('themes');
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          activeTab === 'online_store' && onlineStoreTab === 'themes'
                            ? "bg-white/50 text-brand-dark font-bold"
                            : "text-[#616161] hover:bg-[#E3E3E3]"
                        )}
                      >
                        <Layout className="h-4 w-4" />
                        Themes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('online_store');
                          setOnlineStoreTab('blog');
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          activeTab === 'online_store' && onlineStoreTab === 'blog'
                            ? "bg-white/50 text-brand-dark font-bold"
                            : "text-[#616161] hover:bg-[#E3E3E3]"
                        )}
                      >
                        <Globe className="h-4 w-4" />
                        Blog Posts
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('online_store');
                          setOnlineStoreTab('pages');
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          activeTab === 'online_store' && onlineStoreTab === 'pages'
                            ? "bg-white/50 text-brand-dark font-bold"
                            : "text-[#616161] hover:bg-[#E3E3E3]"
                        )}
                      >
                        <Info className="h-4 w-4" />
                        Pages
                      </button>
                    </div>
                  )}
                </div>
              );
            }
            
            if (item.id === 'collections') return null;

            return (
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
            );
          })}
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
            <button 
              onClick={() => setActiveTab('notifications')}
              className={cn("p-1.5 hover:bg-white/10 rounded-md relative cursor-pointer", activeTab === 'notifications' ? "bg-white/10 text-white" : "text-white/80 hover:text-white")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#1A1A1A]" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none flex items-center gap-2 pl-3 border-l border-white/10 cursor-pointer hover:bg-white/5 py-1 px-2 rounded-md transition-colors bg-transparent border-none appearance-none group">
                <div className="h-7 w-7 bg-brand-gold rounded-full flex items-center justify-center text-[10px] font-bold text-white group-hover:bg-brand-gold/90 transition-colors">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden md:block text-white/90 group-hover:text-white transition-colors">{user?.displayName || 'Admin'}</span>
                <ChevronDown className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 hidden sm:block">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || 'Admin'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer">
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Back to Website</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Dashboard Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      await signOut(auth);
                      navigate('/');
                    } catch (error) {
                      toast.error('Error signing out');
                    }
                  }} 
                  className="text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <span className="w-full">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

                          <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark/60">
                              <ShieldCheck className="h-4 w-4" /> Trust Features
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              {[
                                { id: '15_day_return', label: 'Easy 15 Day Return' },
                                { id: 'lifetime_plating', label: 'Lifetime Plating' },
                                { id: '6_month_warranty', label: '6-Month Warranty' },
                                { id: 'fine_material', label: 'Fine Material (925 Silver / 18K Gold)' }
                              ].map((feature) => (
                                <div key={feature.id} className="flex items-center space-x-3 rounded-md border border-brand-dark/10 p-3">
                                  <input 
                                    type="checkbox" 
                                    id={feature.id}
                                    checked={(editingProduct.features || []).includes(feature.id)}
                                    onChange={(e) => {
                                      const current = editingProduct.features || [];
                                      if (e.target.checked) {
                                        setEditingProduct({...editingProduct, features: [...current, feature.id]});
                                      } else {
                                        setEditingProduct({...editingProduct, features: current.filter(id => id !== feature.id)});
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-brand-dark/20 text-brand-gold focus:ring-brand-gold"
                                  />
                                  <label htmlFor={feature.id} className="text-xs font-bold uppercase tracking-widest text-brand-dark/60 cursor-pointer">{feature.label}</label>
                                </div>
                              ))}
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
            ) : activeTab === 'collections' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Collections</h1>
                    <p className="text-sm text-[#616161]">Group your products into seasonal or themed collections.</p>
                  </div>
                  {!isAddingCollection && (
                    <Button onClick={startAddingCollection} className="bg-brand-dark text-white hover:bg-brand-dark/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Collection
                    </Button>
                  )}
                </div>

                {isAddingCollection ? (
                  <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">
                        {editingCollection ? 'Edit Collection' : 'Create New Collection'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveCollection} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Collection Name</label>
                            <Input 
                              value={collectionForm.name} 
                              onChange={e => setCollectionForm({...collectionForm, name: e.target.value})}
                              required
                              placeholder="e.g. Bridal Collection"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Image URL</label>
                            <Input 
                              value={collectionForm.image} 
                              onChange={e => setCollectionForm({...collectionForm, image: e.target.value})}
                              placeholder="Cover image for the collection"
                            />
                          </div>
                          <div className="col-span-full space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Description</label>
                            <Textarea 
                              value={collectionForm.description} 
                              onChange={e => setCollectionForm({...collectionForm, description: e.target.value})}
                              rows={3}
                              placeholder="Tell the story of this collection..."
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Select Products</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-2 border border-brand-dark/10 rounded-lg bg-[#F9F9F9]">
                            {products.map(p => (
                              <div 
                                key={p.id}
                                onClick={() => {
                                  const currentIds = collectionForm.productIds;
                                  if (currentIds.includes(p.id)) {
                                    setCollectionForm({...collectionForm, productIds: currentIds.filter(id => id !== p.id)});
                                  } else {
                                    setCollectionForm({...collectionForm, productIds: [...currentIds, p.id]});
                                  }
                                }}
                                className={cn(
                                  "cursor-pointer rounded-lg border-2 p-2 transition-all",
                                  collectionForm.productIds.includes(p.id) 
                                    ? "border-brand-gold bg-brand-gold/5 shadow-sm" 
                                    : "border-transparent bg-white hover:border-brand-dark/10"
                                )}
                              >
                                <div className="aspect-square mb-2 bg-[#F0F0F0] rounded overflow-hidden">
                                  <img src={p.images[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <p className="text-[10px] font-bold truncate">{p.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="bg-brand-dark text-white hover:bg-brand-dark/90 px-8">
                            {editingCollection ? 'Update Collection' : 'Create Collection'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingCollection(false);
                              setEditingCollection(null);
                            }}
                            className="bg-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {collections.map((coll) => (
                      <Card key={coll.id} className="overflow-hidden border-none bg-white transition-all hover:shadow-md shadow-sm group">
                        <div className="aspect-video relative bg-[#F9F9F9]">
                          {coll.image ? (
                            <img src={coll.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Layers size={48} className="text-brand-dark/10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <Button size="icon" className="h-10 w-10 rounded-full bg-white text-brand-dark" onClick={() => startEditingCollection(coll)}>
                              <Edit size={18} />
                            </Button>
                            <Button size="icon" className="h-10 w-10 rounded-full bg-red-500 text-white" onClick={() => handleDeleteCollection(coll.id)}>
                              <Trash2 size={18} />
                            </Button>
                          </div>
                          <div className="absolute top-3 left-3 bg-brand-dark/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                            {coll.productIds?.length || 0} Products
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-sm truncate">{coll.name}</h3>
                          <p className="text-xs text-[#616161] line-clamp-2 mt-1">{coll.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {collections.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-[#F9F9F9] rounded-2xl border-2 border-dashed border-[#E3E3E3]">
                        <Layers size={48} className="mx-auto text-[#616161]/20 mb-4" />
                        <p className="text-[#616161]">No collections yet. Create your first themed group of products.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === 'reels' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Instagram Reels</h1>
                    <p className="text-sm text-[#616161]">Manage short videos and link them to products for shop-able reels.</p>
                  </div>
                  {!isAddingReel && (
                    <Button onClick={startAddingReel} className="bg-brand-dark text-white hover:bg-brand-dark/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Reel
                    </Button>
                  )}
                </div>

                {isAddingReel ? (
                  <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">
                        {editingReel ? 'Edit Reel' : 'Add New Reel'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveReel} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Video URL</label>
                             <Input 
                               value={reelForm.videoUrl} 
                               onChange={e => setReelForm({...reelForm, videoUrl: e.target.value})}
                               placeholder="Direct video link (e.g. .mp4 URL)"
                             />
                             <p className="text-[10px] text-brand-dark/40">Tip: Use a direct link to a hosted video file for best compatibility. Leave empty if using Embed Code.</p>
                           </div>
                           <div className="space-y-2">
                             <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Embed Code (Alternative)</label>
                             <Textarea 
                               value={reelForm.embedCode} 
                               onChange={e => setReelForm({...reelForm, embedCode: e.target.value})}
                               placeholder="Paste Instagram/Other Embed HTML here..."
                               className="h-20"
                             />
                             <p className="text-[10px] text-brand-dark/40">Provide either a Video URL OR an Embed Code.</p>
                           </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Linked Product</label>
                            <select 
                              className="w-full rounded-md border border-brand-dark/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                              value={reelForm.productId}
                              onChange={e => setReelForm({...reelForm, productId: e.target.value})}
                              required
                            >
                              <option value="">Select a Product</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Thumbnail URL (Optional)</label>
                            <Input 
                              value={reelForm.thumbnail} 
                              onChange={e => setReelForm({...reelForm, thumbnail: e.target.value})}
                              placeholder="Image URL for the preview"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Caption</label>
                            <Input 
                              value={reelForm.caption} 
                              onChange={e => setReelForm({...reelForm, caption: e.target.value})}
                              placeholder="Short caption for the reel..."
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={isSavingReel}
                            className="bg-brand-dark text-white hover:bg-brand-dark/90 px-8"
                          >
                            {isSavingReel ? 'Saving...' : (editingReel ? 'Update Reel' : 'Save Reel')}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingReel(false);
                              setEditingReel(null);
                            }}
                            className="bg-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {reels.map((reel) => {
                      const product = products.find(p => p.id === reel.productId);
                      return (
                        <Card key={reel.id} className="overflow-hidden border-none bg-white transition-all hover:shadow-md shadow-sm">
                          <div className="aspect-[9/16] relative bg-black group">
                            {reel.thumbnail ? (
                              <img src={reel.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film size={48} className="text-white/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <Button size="icon" className="h-10 w-10 rounded-full bg-white text-brand-dark" onClick={() => startEditingReel(reel)}>
                                <Edit size={18} />
                              </Button>
                              <Button size="icon" className="h-10 w-10 rounded-full bg-red-500 text-white" onClick={() => handleDeleteReel(reel.id)}>
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-1">
                              <h3 className="font-bold text-sm truncate">{reel.caption || 'No Caption'}</h3>
                              <p className="text-xs text-[#616161] truncate">Product: {product?.name || 'Unknown'}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {reels.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-[#F9F9F9] rounded-2xl border-2 border-dashed border-[#E3E3E3]">
                        <Film size={48} className="mx-auto text-[#616161]/20 mb-4" />
                        <p className="text-[#616161]">No reels added yet. Start by adding your first shop-able reel!</p>
                      </div>
                    )}
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
            ) : activeTab === 'authentication' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Authentication</h1>
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
                        Update Login UI
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

              <Card className="border-none shadow-sm bg-white h-fit">
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Custom SMTP Settings</CardTitle>
                  <CardDescription>Store your SMTP details here for automated emails.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg bg-orange-50 p-4 border border-orange-100 mb-6">
                    <p className="text-sm text-orange-800 leading-relaxed">
                      <strong>Important Security Notice:</strong> Because Firebase handles user passwords with bank-level security, our custom code cannot send the Password Reset Email directly. Adding your Gmail credentials below will save them to your database for other notification emails, but to actually stop <strong>Firebase Password Reset</strong> emails from going to spam, <strong>you must manually paste these exact details into the Firebase Console</strong>:
                      <br/><br/>
                      1. Go to Firebase Console &gt; Authentication &gt; Templates<br/>
                      2. Click "Password Reset"<br/>
                      3. Click "SMTP Settings"<br/>
                      4. Paste the username and App Password you configure below.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">SMTP Host</label>
                        <Input 
                          value={smtpSettings.host} 
                          onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                          placeholder="smtp.gmail.com" 
                          className="bg-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">SMTP Port</label>
                        <Input 
                          value={smtpSettings.port} 
                          onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                          placeholder="465" 
                          className="bg-white" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">SMTP Username</label>
                      <Input 
                        value={smtpSettings.username} 
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })}
                        placeholder="business.saloarhussain@gmail.com" 
                        className="bg-white" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">App Password / SMTP Password</label>
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

                  <Button onClick={saveSmtpSettings} className="w-full bg-brand-dark text-white rounded-xl py-6">Save SMTP Settings</Button>
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
            ) : activeTab === 'payment' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Payment Methods</h1>
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
              </div>
            ) : activeTab === 'checkout' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Checkout Settings</h1>
                </div>

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
            ) : activeTab === 'online_store' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Online Store</h1>
                    <p className="text-sm text-[#616161]">Manage your blog, pages, and store appearance.</p>
                  </div>
                </div>

                <div className="w-full">
                  {onlineStoreTab === 'themes' ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold">Theme Configuration</h2>
                          <Button onClick={handleSaveTheme} className="bg-brand-dark text-white hover:bg-brand-dark/90">
                            <Save className="mr-2 h-4 w-4" /> Save Theme
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <Card className="border-none shadow-sm bg-white">
                             <CardHeader>
                               <CardTitle className="text-lg font-bold">Branding Colors</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                               <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Primary Accent</label>
                                 <div className="flex gap-2">
                                   <Input type="color" value={themeConfig.primaryColor} onChange={e => setThemeConfig({...themeConfig, primaryColor: e.target.value})} className="w-12 h-10 p-1" />
                                   <Input value={themeConfig.primaryColor} onChange={e => setThemeConfig({...themeConfig, primaryColor: e.target.value})} />
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Secondary Color</label>
                                 <div className="flex gap-2">
                                   <Input type="color" value={themeConfig.secondaryColor} onChange={e => setThemeConfig({...themeConfig, secondaryColor: e.target.value})} className="w-12 h-10 p-1" />
                                   <Input value={themeConfig.secondaryColor} onChange={e => setThemeConfig({...themeConfig, secondaryColor: e.target.value})} />
                                 </div>
                               </div>
                             </CardContent>
                           </Card>

                            <Card className="border-none shadow-sm bg-white">
                              <CardHeader>
                                <CardTitle className="text-lg font-bold">Announcement Bar</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    checked={themeConfig.showAnnouncementBar} 
                                    onChange={e => setThemeConfig({...themeConfig, showAnnouncementBar: e.target.checked})}
                                    id="show-announcement"
                                    className="rounded border-brand-dark/20 text-brand-gold focus:ring-brand-gold"
                                  />
                                  <label htmlFor="show-announcement" className="text-sm font-medium">Show Announcement Bar</label>
                                </div>
                                <div className="space-y-3">
                                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Announcements List</label>
                                  {(themeConfig.announcements || []).map((text: string, index: number) => (
                                    <div key={index} className="flex gap-2">
                                      <Input 
                                        value={text} 
                                        onChange={e => {
                                          const newAnn = [...(themeConfig.announcements || [])];
                                          newAnn[index] = e.target.value;
                                          setThemeConfig({...themeConfig, announcements: newAnn});
                                        }} 
                                        placeholder={`Announcement ${index + 1}`}
                                      />
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-red-400 hover:text-red-500"
                                        onClick={() => {
                                          const newAnn = (themeConfig.announcements || []).filter((_: any, i: number) => i !== index);
                                          setThemeConfig({...themeConfig, announcements: newAnn});
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  {(themeConfig.announcements || []).length < 5 && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full border-dashed"
                                      onClick={() => {
                                        setThemeConfig({
                                          ...themeConfig, 
                                          announcements: [...(themeConfig.announcements || []), '']
                                        });
                                      }}
                                    >
                                      <Plus className="mr-2 h-3 w-3" /> Add Announcement
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                           <Card className="border-none shadow-sm bg-white md:col-span-2">
                             <CardHeader>
                               <CardTitle className="text-lg font-bold">Homepage Hero Section</CardTitle>
                             </CardHeader>
                             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Hero Title</label>
                                 <Input value={themeConfig.heroTitle} onChange={e => setThemeConfig({...themeConfig, heroTitle: e.target.value})} />
                               </div>
                               <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Hero Subtitle</label>
                                 <Input value={themeConfig.heroSubtitle} onChange={e => setThemeConfig({...themeConfig, heroSubtitle: e.target.value})} />
                               </div>
                             </CardContent>
                           </Card>
                        </div>
                      </div>
                    ) : onlineStoreTab === 'pages' ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold">Shop Pages</h2>
                          {!isAddingPage && (
                            <Button onClick={startAddingPage} className="bg-brand-dark text-white hover:bg-brand-dark/90">
                              <Plus className="mr-2 h-4 w-4" /> New Page
                            </Button>
                          )}
                        </div>

                        {isAddingPage ? (
                          <Card className="border-none shadow-sm bg-white">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold">{editingPage ? 'Edit Page' : 'Create New Page'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <form onSubmit={handleSavePage} className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                      <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Page Title</label>
                                      <Input value={pageForm.title} onChange={e => {
                                        const title = e.target.value;
                                        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                        setPageForm({...pageForm, title, slug});
                                      }} required placeholder="e.g. About Us" className="bg-white" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">URL Slug</label>
                                      <div className="flex items-center gap-1 text-sm bg-brand-dark/5 px-3 py-2 rounded-md border border-brand-dark/10">
                                        <span className="text-brand-dark/40">/pages/</span>
                                        <input className="bg-transparent border-none focus:outline-none flex-1 font-mono" value={pageForm.slug} onChange={e => setPageForm({...pageForm, slug: e.target.value})} />
                                      </div>
                                   </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Page Content</label>
                                    <Textarea value={pageForm.content} onChange={e => setPageForm({...pageForm, content: e.target.value})} rows={12} required placeholder="Write your page content here..." className="bg-white" />
                                 </div>
                                 <div className="flex gap-2 pt-2">
                                   <Button type="submit" className="bg-brand-dark text-white hover:bg-brand-dark/90 h-10 px-8">Save Page</Button>
                                   <Button type="button" variant="outline" onClick={() => setIsAddingPage(false)} className="bg-white">Cancel</Button>
                                 </div>
                               </form>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {pages.map(page => (
                              <Card key={page.id} className="border-none shadow-sm bg-white overflow-hidden group">
                                <CardContent className="p-4 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-brand-gold/10 rounded-lg flex items-center justify-center text-brand-gold">
                                      <Info className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h3 className="font-bold">{page.title}</h3>
                                      <p className="text-xs text-brand-dark/40 font-mono">/pages/{page.slug}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => startEditingPage(page)} className="text-brand-dark/60 hover:text-brand-dark">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeletePage(page.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            {pages.length === 0 && (
                              <div className="text-center py-12 text-brand-dark/30 italic bg-white rounded-xl border border-dashed border-brand-dark/20">
                                No pages created yet.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold">Manage Blog Posts</h2>
                          {!isAddingBlogPost && (
                            <Button onClick={startAddingBlogPost} className="bg-brand-dark text-white hover:bg-brand-dark/90">
                              <Plus className="mr-2 h-4 w-4" /> New Post
                            </Button>
                          )}
                        </div>

                        {isAddingBlogPost ? (
                      <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold">
                            {editingBlogPost ? 'Edit Post' : 'Create New Article'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleSaveBlogPost} className="space-y-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Title</label>
                                <Input 
                                  value={blogPostForm.title} 
                                  onChange={e => setBlogPostForm({...blogPostForm, title: e.target.value})}
                                  required
                                  placeholder="e.g. The Secrets of Aura Jewelry"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Author</label>
                                  <Input 
                                    value={blogPostForm.author} 
                                    onChange={e => setBlogPostForm({...blogPostForm, author: e.target.value})}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Image URL</label>
                                  <Input 
                                    value={blogPostForm.image} 
                                    onChange={e => setBlogPostForm({...blogPostForm, image: e.target.value})}
                                    placeholder="Featured image URL"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Excerpt</label>
                                <Textarea 
                                  value={blogPostForm.excerpt} 
                                  onChange={e => setBlogPostForm({...blogPostForm, excerpt: e.target.value})}
                                  rows={2}
                                  placeholder="Short summary for the blog listing..."
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-brand-dark/60">Content</label>
                                <Textarea 
                                  value={blogPostForm.content} 
                                  onChange={e => setBlogPostForm({...blogPostForm, content: e.target.value})}
                                  rows={10}
                                  required
                                  placeholder="Write your article content here..."
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <Button type="submit" className="bg-brand-dark text-white hover:bg-brand-dark/90 px-8">
                                {editingBlogPost ? 'Update Post' : 'Publish Post'}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setIsAddingBlogPost(false);
                                  setEditingBlogPost(null);
                                }}
                                className="bg-white"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blogPosts.map((post) => (
                          <Card key={post.id} className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-all">
                            <div className="aspect-[21/9] bg-[#F9F9F9]">
                              {post.image && <img src={post.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-sm line-clamp-1">{post.title}</h3>
                                <div className="flex gap-1">
                                  <button onClick={() => startEditingBlogPost(post)} className="text-brand-dark/40 hover:text-brand-dark p-1">
                                    <Edit size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteBlogPost(post.id)} className="text-red-400 hover:text-red-500 p-1">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-[10px] text-[#616161] line-clamp-2">{post.excerpt}</p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-brand-dark/30">{post.date}</span>
                                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">By: {post.author}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {blogPosts.length === 0 && (
                          <div className="col-span-full py-12 text-center text-brand-dark/30 italic">
                            No blog posts yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            ) : activeTab === 'settings' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Settings</h1>
                </div>

                {/* Trustpilot Section */}
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Trustpilot Configuration</CardTitle>
                    <CardDescription>Integrate Trustpilot to show product reviews.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-xl bg-[#F9F9F9] border border-[#E3E3E3]">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold">Trustpilot</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            trustpilotSettings.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {trustpilotSettings.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Business Unit ID</label>
                            <Input 
                              value={trustpilotSettings.businessUnitId}
                              onChange={(e) => setTrustpilotSettings({ ...trustpilotSettings, businessUnitId: e.target.value })}
                              placeholder="e.g. YOUR_BUSINESS_ID" 
                              className="bg-white" 
                            />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">Template ID</label>
                            <Input 
                              value={trustpilotSettings.templateId}
                              onChange={(e) => setTrustpilotSettings({ ...trustpilotSettings, templateId: e.target.value })}
                              placeholder="e.g. YOUR_TEMPLATE_ID" 
                              className="bg-white" 
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <input 
                            type="checkbox" 
                            id="trustpilot-enabled"
                            checked={trustpilotSettings.enabled}
                            onChange={(e) => setTrustpilotSettings({ ...trustpilotSettings, enabled: e.target.checked })}
                            className="rounded border-brand-dark/20 text-brand-gold focus:ring-brand-gold h-4 w-4"
                          />
                          <label htmlFor="trustpilot-enabled" className="text-sm font-medium">Enable Trustpilot Reviews</label>
                        </div>
                        <Button 
                          className="bg-brand-dark text-white hover:bg-brand-dark/90 mt-4"
                          onClick={saveTrustpilotSettings}
                        >
                          Save Trustpilot Config
                        </Button>
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

      {/* Debug Info for Admin troubleshooting - only visible to logged in users */}
      {user && (
        <div className="fixed bottom-0 right-0 p-1 text-[8px] text-brand-dark/20 bg-white/50 backdrop-blur-sm rounded-tl flex gap-2">
          <span>UID: {user.uid}</span>
          <span>Email: {user.email}</span>
          <span>Admin: {isAdmin ? 'Yes' : 'No'}</span>
        </div>
      )}
    </div>
  );
}
