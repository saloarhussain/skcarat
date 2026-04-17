export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: 'rings' | 'necklaces' | 'earrings' | 'bracelets';
  images: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  // New fields for admin dashboard
  about?: string;
  details?: string;
  shippingReturns?: string;
  exclusiveOffers?: string;
  label?: string; // e.g. "Best Seller", "New Arrival"
  variants?: {
    name: string;
    image: string;
  }[];
  offers?: {
    title: string;
    description: string;
    code: string;
  }[];
  features?: string[]; // Array of feature keys like '15_day_return', 'lifetime_plating'
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
}

export interface Reel {
  id: string;
  videoUrl?: string;
  embedCode?: string;
  productId: string;
  caption?: string;
  thumbnail?: string;
  createdAt: any;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image?: string;
  productIds: string[];
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  loyaltyPoints: number;
  wishlist: string[]; // Product IDs
  browsingHistory: string[]; // Product IDs
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: string;
}
