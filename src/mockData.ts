import { Product, BlogPost } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Eternal Rose Gold Ring',
    description: 'A stunning 18k rose gold ring adorned with a brilliant-cut diamond. Perfect for engagements or special occasions.',
    price: 1299,
    category: 'rings',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'],
    rating: 4.8,
    reviewsCount: 124,
    stock: 15,
    isFeatured: true,
    isNew: true,
    about: 'The Eternal Rose Gold Ring is a masterpiece of modern jewelry design. Each diamond is hand-selected for its brilliance and set in a delicate rose gold band that symbolizes eternal love and commitment.',
    details: 'Material: 18K Rose Gold. Gemstone: 0.5ct Brilliant-Cut Diamond (VVS1 clarity, E color). Weight: 3.2g. Certification: IGI Certified.',
    shippingReturns: 'Free insured shipping within India. 15-day no-questions-asked return policy. Lifetime exchange available.',
    exclusiveOffers: 'Free professional cleaning kit with every purchase.',
    variants: [
      { name: 'Silver', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800' },
      { name: 'Rose Gold', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800' },
      { name: 'Golden', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '2',
    name: 'Sapphire Dreams Necklace',
    description: 'Deep blue sapphire pendant surrounded by a halo of white gold and small diamonds.',
    price: 850,
    category: 'necklaces',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'],
    rating: 4.9,
    reviewsCount: 89,
    stock: 8,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Pearl Elegance Earrings',
    description: 'Classic freshwater pearl earrings with a modern minimalist gold setting.',
    price: 299,
    category: 'earrings',
    images: ['https://images.unsplash.com/photo-1535633302704-b02f4fad253d?auto=format&fit=crop&q=80&w=800'],
    rating: 4.7,
    reviewsCount: 56,
    stock: 25
  },
  {
    id: '4',
    name: 'Golden Link Bracelet',
    description: 'A bold yet elegant 14k gold link bracelet that complements any outfit.',
    price: 450,
    category: 'bracelets',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800'],
    rating: 4.6,
    reviewsCount: 42,
    stock: 12,
    isNew: true
  },
  {
    id: '5',
    name: 'Diamond Studs',
    description: 'Timeless diamond stud earrings in a platinum four-prong setting.',
    price: 1500,
    category: 'earrings',
    images: ['https://images.unsplash.com/photo-1635767790474-17709c9212a4?auto=format&fit=crop&q=80&w=800'],
    rating: 5.0,
    reviewsCount: 210,
    stock: 5,
    isFeatured: true
  }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'How to Choose the Perfect Engagement Ring',
    excerpt: 'Finding the one is hard, but finding the ring shouldn\'t be. Our guide to the 4Cs and beyond.',
    content: 'Full content here...',
    image: 'https://images.unsplash.com/photo-1588444837495-c6cfaf504670?auto=format&fit=crop&q=80&w=800',
    author: 'Elena Vance',
    date: '2024-03-15',
    tags: ['Guide', 'Engagement', 'Diamonds']
  },
  {
    id: '2',
    title: 'Jewelry Trends for Spring 2024',
    excerpt: 'From chunky gold to colorful gemstones, see what\'s hot this season.',
    content: 'Full content here...',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    author: 'Marcus Aurelius',
    date: '2024-03-10',
    tags: ['Trends', 'Fashion']
  }
];
