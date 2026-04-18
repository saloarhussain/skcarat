import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Reel } from '@/types';
import { Play, Volume2, VolumeX } from 'lucide-react';

export default function ReelsSection() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeReels = onSnapshot(
      query(collection(db, 'reels'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const reelsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Reel[];
        setReels(reelsData);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeReels();
    };
  }, []);

  useEffect(() => {
    if (reels.some(r => r.embedCode)) {
      const scriptId = 'instagram-embed-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
      } else {
        setTimeout(() => {
          (window as any).instgrm?.Embeds?.process();
        }, 100);
      }
    }
  }, [reels]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only intercept if primarily scrolling vertically
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Find if we are at horizontal limits
        const atStart = container.scrollLeft <= 0;
        const atEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth;

        // If we are at the beginning and scrolling up, let it scroll page vertically
        if (atStart && e.deltaY < 0) return;
        // If we are at the end and scrolling down, let it scroll page vertically
        if (atEnd && e.deltaY > 0) return;

        e.preventDefault();
        container.scrollBy({
          left: e.deltaY * 2,
          behavior: 'smooth'
        });
      }
    };

    // Need passive: false to allow e.preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [reels]);

  if (loading || reels.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-32 relative py-12">
      <div className="mb-10 text-center">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-widest text-brand-gold">
          Follow Us
        </span>
        <h2 className="text-3xl font-light md:text-5xl">Instagram Reels</h2>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 items-start snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing"
      >
        {reels.map((reel) => (
          <div key={reel.id} className="flex-none w-[200px] md:w-[240px] lg:w-[280px] snap-center">
            <ReelCard reel={reel} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  if (reel.embedCode) {
    // Attempt to remove caption attribute if the user pasted it with caption enabled, reducing total height
    const cleanEmbed = reel.embedCode.replace(/data-instgrm-captioned/g, "");

    return (
      <div className="relative group w-full aspect-[9/16] max-w-[280px] mx-auto bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-white">
        <style>{`
          .instagram-crop-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
          }
          .instagram-crop-wrapper iframe {
            width: 100% !important;
            height: 100% !important;
            min-width: 100% !important;
            border-radius: 0 !important;
          }
        `}</style>
        <div 
          className="instagram-crop-wrapper"
          dangerouslySetInnerHTML={{ __html: cleanEmbed }}
        />
      </div>
    );
  }

  return (
    <div className="relative group w-full aspect-[9/16] max-w-[280px] mx-auto bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg border-2 border-white">
      <video
        src={reel.videoUrl}
        poster={reel.thumbnail || undefined}
        autoPlay={true}
        loop={true}
        muted={true}
        playsInline={true}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error("Video failed to load:", reel.videoUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {reel.caption && (
        <div className="absolute bottom-16 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10">
          <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-md">
            {reel.caption}
          </p>
        </div>
      )}

      {/* Detail Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <Link
          to={`/products/${reel.productId}`}
          className="block w-full text-center py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Product
        </Link>
      </div>
    </div>
  );
}
