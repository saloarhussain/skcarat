import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { BlogPost } from '@/types';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().date || new Date().toISOString()
      })) as BlogPost[];
      setBlogPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching blog posts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-12">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-light">Style & Inspiration</h1>
        <p className="mx-auto max-w-2xl text-brand-dark/60">
          Explore our latest style tips, jewelry care guides, and behind-the-scenes stories from the world of Aura.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Blog List */}
        <div className="lg:col-span-2 flex flex-col gap-12">
          {blogPosts.length > 0 ? blogPosts.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <Link to={`/blog/${post.id}`} className="block aspect-[21/9] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <div className="p-8">
                <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-widest text-brand-dark/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {post.author}
                  </span>
                </div>
                <Link to={`/blog/${post.id}`}>
                  <h2 className="mb-4 font-serif text-3xl font-medium leading-tight group-hover:text-brand-gold transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <p className="mb-6 text-lg text-brand-dark/60">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(post.tags || []).map(tag => (
                      <span key={tag} className="rounded-full bg-brand-paper px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link to={`/blog/${post.id}`} className={cn(buttonVariants({ variant: "link" }), "text-brand-gold flex items-center gap-2")}>
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          )) : (
            <div className="py-20 text-center">
              <h3 className="text-2xl font-light">No blog posts found</h3>
              <p className="text-brand-dark/60">Check back later for fresh inspiration.</p>
            </div>
          )}
        </div>
...
        {/* Sidebar */}
        <aside className="flex flex-col gap-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 font-serif text-xl font-medium">Categories</h3>
            <ul className="space-y-4">
              {['Style Tips', 'New Arrivals', 'Jewelry Care', 'Gift Guides', 'Behind the Scenes'].map(cat => (
                <li key={cat}>
                  <Link to={`/blog?category=${cat.toLowerCase().replace(' ', '-')}`} className="flex items-center justify-between text-brand-dark/60 hover:text-brand-gold">
                    <span>{cat}</span>
                    <span className="text-xs opacity-50">(12)</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-brand-dark p-8 text-white shadow-sm">
            <h3 className="mb-4 font-serif text-xl font-medium text-brand-champagne">Personalized Tips</h3>
            <p className="mb-6 text-sm text-brand-paper/60">
              Get jewelry recommendations tailored to your unique style and preferences.
            </p>
            <Button className="w-full bg-brand-gold text-white hover:bg-brand-gold/90">
              Take Style Quiz
            </Button>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 font-serif text-xl font-medium">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['Diamonds', 'Gold', 'Wedding', 'Minimalist', 'Vintage', 'Luxury'].map(tag => (
                <Link
                  key={tag}
                  to={`/blog?tag=${tag.toLowerCase()}`}
                  className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs text-brand-dark/60 hover:border-brand-gold hover:text-brand-gold"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
