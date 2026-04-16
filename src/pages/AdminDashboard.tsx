import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/FirebaseProvider';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Package, Tag, Info, Truck, Gift, MessageCircle, Mail, Upload, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'payments' | 'login' | 'customers'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
      fetchCustomers();
    }
  }, [isAdmin]);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      const subscribersSnapshot = await getDocs(collection(db, 'subscribers'));
      const subscribersData = subscribersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscribers(subscribersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customer data');
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchOrders = async () => {    setOrdersLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const [authSettings, setAuthSettings] = useState({
    emailEnabled: true,
    googleEnabled: true,
    whatsappEnabled: false,
    privacyPolicyUrl: '/privacy-policy',
    termsUrl: '/terms',
    supportEmail: 'support@aurajewelry.com',
    whatsappNumber: '+919876543210'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'auth_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAuthSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error('Error fetching auth settings:', error);
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
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
      fetchProducts();
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

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-12">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-light">Admin Dashboard</h1>
          <p className="text-brand-dark/60">Manage your jewelry collection and product details.</p>
        </div>
        {!editingProduct && (
          <div className="flex gap-4">
            <div className="flex rounded-lg border border-brand-dark/10 p-1 bg-white">
              <Button 
                variant={activeTab === 'products' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('products')}
                className={cn(activeTab === 'products' && "bg-brand-dark text-white")}
              >
                Products
              </Button>
              <Button 
                variant={activeTab === 'orders' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('orders')}
                className={cn(activeTab === 'orders' && "bg-brand-dark text-white")}
              >
                Orders
              </Button>
              <Button 
                variant={activeTab === 'customers' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('customers')}
                className={cn(activeTab === 'customers' && "bg-brand-dark text-white")}
              >
                Customers
              </Button>
              <Button 
                variant={activeTab === 'payments' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('payments')}
                className={cn(activeTab === 'payments' && "bg-brand-dark text-white")}
              >
                Payments
              </Button>
              <Button 
                variant={activeTab === 'login' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('login')}
                className={cn(activeTab === 'login' && "bg-brand-dark text-white")}
              >
                Login
              </Button>
            </div>
            {activeTab === 'products' && (
              <Button onClick={startAdding} className="bg-brand-gold text-white hover:bg-brand-gold/90">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            )}
          </div>
        )}
      </div>

      {activeTab === 'products' ? (
        <>
          {editingProduct && (
        <Card className="mb-12 border-brand-dark/10 bg-white shadow-lg">
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

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark/60">
                    <Gift className="h-4 w-4" /> Exclusive Offers
                  </label>
                  <Input 
                    value={editingProduct.exclusiveOffers} 
                    onChange={e => setEditingProduct({...editingProduct, exclusiveOffers: e.target.value})}
                    placeholder="e.g. Free cleaning kit, 10% off next purchase..."
                  />
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
      )}

          {/* Product List */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden border-brand-dark/5 bg-white transition-shadow hover:shadow-md">
                <div className="aspect-square overflow-hidden bg-brand-paper">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-medium">{product.name}</h3>
                      <p className="text-sm text-brand-dark/60 capitalize">{product.category}</p>
                    </div>
                    <span className="text-lg font-bold text-brand-gold">₹{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => startEditing(product)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : activeTab === 'customers' ? (
        <div className="space-y-8">
          <Card className="border-brand-dark/5 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Registered Users</CardTitle>
              <CardDescription>Users who have signed up for an account.</CardDescription>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
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
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Newsletter Subscribers</CardTitle>
              <CardDescription>Users who have subscribed to the newsletter.</CardDescription>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
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
                            order.status === 'paid' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {order.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-dark/5 text-brand-dark/60">
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
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
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'orders', order.id), { status: 'completed' });
                                toast.success('Order marked as completed');
                                fetchOrders();
                              } catch (error) {
                                toast.error('Failed to update order');
                              }
                            }}
                            disabled={order.status === 'completed'}
                          >
                            Mark as Completed
                          </Button>
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
      ) : activeTab === 'login' ? (
        <div className="space-y-8">
          <Card className="border-brand-dark/5 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Authentication Settings</CardTitle>
              <CardDescription>Configure how your customers log in to Aura Jewelry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Email Auth Section */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-2xl bg-brand-paper border border-brand-dark/5">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#EC7B8F] rounded flex items-center justify-center text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-medium">Email & Password Login</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      authSettings.emailEnabled ? "bg-green-100 text-green-700" : "bg-brand-dark/10 text-brand-dark/40"
                    )}>
                      {authSettings.emailEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-sm text-brand-dark/60 max-w-xl">
                    Allow users to log in using their email address and password. This includes mandatory email verification for new accounts.
                  </p>
                  <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                    <p className="text-[10px] text-blue-800 leading-relaxed">
                      <strong>Note:</strong> To use Email Auth, you must enable "Email/Password" as a sign-in provider in your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold">Firebase Console</a>.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Current Status</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={cn("h-2 w-2 rounded-full", authSettings.emailEnabled ? "bg-green-500" : "bg-brand-dark/20")} />
                        <span>Firebase Auth: {authSettings.emailEnabled ? "Connected" : "Disconnected"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Email Verification: Mandatory for Sign Up</span>
                      </div>
                    </div>
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
                    "p-6 rounded-2xl border transition-all text-left group",
                    authSettings.googleEnabled ? "bg-white border-brand-dark/5" : "bg-brand-dark/[0.02] border-brand-dark/5 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    <h4 className="font-medium">Google Login</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      authSettings.googleEnabled ? "bg-green-100 text-green-700" : "bg-brand-dark/10 text-brand-dark/40"
                    )}>
                      {authSettings.googleEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-brand-dark/60">One-tap login using Google accounts. Fully configured and active.</p>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to {authSettings.googleEnabled ? 'Disable' : 'Enable'}
                  </div>
                </button>

                <button 
                  onClick={() => saveAuthSettings({...authSettings, whatsappEnabled: !authSettings.whatsappEnabled})}
                  className={cn(
                    "p-6 rounded-2xl border transition-all text-left group",
                    authSettings.whatsappEnabled ? "bg-white border-brand-dark/5" : "bg-brand-dark/[0.02] border-brand-dark/5 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    <h4 className="font-medium">WhatsApp Login</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      authSettings.whatsappEnabled ? "bg-green-100 text-green-700" : "bg-brand-dark/10 text-brand-dark/40"
                    )}>
                      {authSettings.whatsappEnabled ? "Enabled" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-brand-dark/60">Direct login via WhatsApp message. Currently in development phase.</p>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to {authSettings.whatsappEnabled ? 'Disable' : 'Enable'}
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card id="login-customization" className="border-brand-dark/5 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Login Customization</CardTitle>
              <CardDescription>Update the text and links shown in the login modal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Privacy Policy URL</label>
                  <Input 
                    value={authSettings.privacyPolicyUrl} 
                    onChange={e => setAuthSettings({...authSettings, privacyPolicyUrl: e.target.value})}
                    className="bg-brand-paper/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Terms & Conditions URL</label>
                  <Input 
                    value={authSettings.termsUrl} 
                    onChange={e => setAuthSettings({...authSettings, termsUrl: e.target.value})}
                    className="bg-brand-paper/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Support Email</label>
                  <Input 
                    value={authSettings.supportEmail} 
                    onChange={e => setAuthSettings({...authSettings, supportEmail: e.target.value})}
                    className="bg-brand-paper/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">WhatsApp Business Number</label>
                  <Input 
                    value={authSettings.whatsappNumber} 
                    onChange={e => setAuthSettings({...authSettings, whatsappNumber: e.target.value})}
                    className="bg-brand-paper/50" 
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
      ) : (
        <div className="space-y-8">
          <Card className="border-brand-dark/5 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Payment Integrations</CardTitle>
              <CardDescription>Manage your payment gateways and transaction settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Razorpay Section */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-2xl bg-brand-paper border border-brand-dark/5">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-8" referrerPolicy="no-referrer" />
                    <h3 className="text-xl font-medium">Razorpay</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      (import.meta as any).env.VITE_RAZORPAY_KEY_ID ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {(import.meta as any).env.VITE_RAZORPAY_KEY_ID ? "Connected" : "Not Configured"}
                    </span>
                  </div>
                  <p className="text-sm text-brand-dark/60 max-w-xl">
                    Razorpay is India's leading payments solution. It allows you to accept payments via UPI, Credit/Debit Cards, Netbanking, and Wallets.
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Configuration Status</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={cn("h-2 w-2 rounded-full", (import.meta as any).env.VITE_RAZORPAY_KEY_ID ? "bg-green-500" : "bg-yellow-500")} />
                        <span>Key ID: {(import.meta as any).env.VITE_RAZORPAY_KEY_ID ? "✓ Set" : "✗ Missing (Demo Mode Active)"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={cn("h-2 w-2 rounded-full", (import.meta as any).env.VITE_RAZORPAY_KEY_ID ? "bg-green-500" : "bg-yellow-500")} />
                        <span>Key Secret: {(import.meta as any).env.VITE_RAZORPAY_KEY_ID ? "✓ Set" : "✗ Missing (Demo Mode Active)"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 shrink-0">
                  <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                    <Button variant="outline" className="w-full">
                      Get API Keys
                    </Button>
                  </a>
                  <Button className="bg-brand-dark text-white hover:bg-brand-dark/90 w-full md:w-auto">
                    Configure
                  </Button>
                </div>
              </div>

              {/* Stripe Section (Placeholder) */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 rounded-2xl bg-white border border-brand-dark/5 opacity-60 grayscale">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#635BFF] rounded flex items-center justify-center text-white font-bold text-xl">S</div>
                    <h3 className="text-xl font-medium">Stripe</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-dark/10 text-brand-dark/40">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-sm text-brand-dark/60 max-w-xl">
                    Accept international payments easily with Stripe. Support for Apple Pay, Google Pay, and global currencies.
                  </p>
                </div>
                <Button variant="outline" disabled className="w-full md:w-auto">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-dark/5 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Recent Transactions</CardTitle>
              <CardDescription>A summary of your latest successful payments.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.filter(o => o.status === 'paid').length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-brand-dark/40">No successful transactions yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.filter(o => o.status === 'paid').slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-brand-dark/5">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-brand-dark/40">ID: {order.paymentId || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-gold">₹{order.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-brand-dark/40">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
