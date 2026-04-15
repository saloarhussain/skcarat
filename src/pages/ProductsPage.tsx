import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || 'all';
  const filter = searchParams.get('filter') || 'all';

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesFilter = filter === 'all' || (filter === 'new' && product.isNew);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesFilter && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [products, category, filter, searchQuery, sortBy]);

  const categories = ['all', 'rings', 'necklaces', 'earrings', 'bracelets'];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="m-[5px]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-light capitalize">
            {category === 'all' ? 'All Collections' : category}
          </h1>
          <p className="text-brand-dark/60">
            Discover our exquisite range of {category === 'all' ? 'fine jewelry' : category}
          </p>
        </div>

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Search and Filter */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
            <Input
              placeholder="Search products..."
              className="pl-10 rounded-full border-brand-dark/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Sheet>
            <SheetTrigger render={<Button variant="outline" className="rounded-full border-brand-dark/10" />}>
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </SheetTrigger>
            <SheetContent className="bg-brand-paper">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search to find the perfect piece.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-8">
                <div>
                  <h3 className="mb-4 font-medium">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Button
                        key={cat}
                        variant={category === cat ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full capitalize"
                        onClick={() => setSearchParams({ category: cat })}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 font-medium">Sort By</h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'featured', label: 'Featured' },
                      { id: 'price-low', label: 'Price: Low to High' },
                      { id: 'price-high', label: 'Price: High to Low' },
                      { id: 'rating', label: 'Customer Rating' },
                    ].map(option => (
                      <Button
                        key={option.id}
                        variant={sortBy === option.id ? 'secondary' : 'ghost'}
                        className="justify-start"
                        onClick={() => setSortBy(option.id)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Category Tabs */}
        <Tabs 
          value={category} 
          onValueChange={(val) => setSearchParams({ category: val })}
          className="hidden lg:block"
        >
          <TabsList className="bg-transparent">
            {categories.map(cat => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-full px-6 data-[state=active]:bg-brand-dark data-[state=active]:text-white capitalize"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Results */}
      <div className="mb-8 flex items-center justify-between border-b border-brand-dark/10 pb-4">
        <p className="text-sm text-brand-dark/60">
          Showing {filteredProducts.length} results
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <h3 className="text-2xl font-light">No products found</h3>
          <p className="text-brand-dark/60">Try adjusting your search or filters.</p>
          <Button
            variant="link"
            className="mt-4 text-brand-gold"
            onClick={() => {
              setSearchQuery('');
              setSearchParams({});
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  </div>
);
}
