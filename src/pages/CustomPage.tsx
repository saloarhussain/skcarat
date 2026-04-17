import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function CustomPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    const q = query(collection(db, 'pages'), where('slug', '==', slug), where('isVisible', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPage(snapshot.docs[0].data());
      } else {
        setPage(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-light text-brand-dark">Page Not Found</h2>
        <p className="mt-4 text-brand-dark/60">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-8 inline-block text-brand-gold hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-paper min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center text-brand-dark/60 hover:text-brand-gold mb-8 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
          <h1 className="text-4xl font-serif font-bold mb-8 text-brand-dark">{page.title}</h1>
          <div 
            className="prose prose-brand max-w-none text-brand-dark/70 space-y-6 dangerously-set-html" 
            dangerouslySetInnerHTML={{ __html: page.content }} 
          />
        </div>
      </div>
    </div>
  );
}
