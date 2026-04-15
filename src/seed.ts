import { db } from './firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { MOCK_PRODUCTS } from './mockData';

export async function seedProducts() {
  const batch = writeBatch(db);
  const productsRef = collection(db, 'products');

  MOCK_PRODUCTS.forEach((product) => {
    const docRef = doc(productsRef, product.id);
    batch.set(docRef, {
      ...product,
      createdAt: new Date().toISOString()
    });
  });

  try {
    await batch.commit();
    console.log('Products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}
