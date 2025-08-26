import { collection, getDocs } from 'firebase/firestore';
import { firestore } from './client';
import type { Category, UnitOfMeasure, Region, Supplier } from '@/lib/types';

/**
 * Fetches all categories from the Firestore database.
 * TODO: Add kitchenId parameter for multi-tenancy.
 * @returns A promise that resolves to an array of categories.
 */
export async function getCategories(): Promise<Category[]> {
  // In a real multi-tenant app, you would add a where() clause here.
  // e.g., where('kitchenId', '==', user.kitchenId)
  try {
    const categoriesCollection = collection(firestore, 'categories');
    const querySnapshot = await getDocs(categoriesCollection);
    const categoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    return categoriesData;
  } catch (error) {
    console.error("Error fetching categories: ", error);
    // In a real app, you'd want more robust error handling, maybe throwing the error
    // to be caught by an error boundary.
    return []; // Return empty array on error
  }
}

/**
 * Fetches all units of measure from the Firestore database.
 * @returns A promise that resolves to an array of UOMs.
 */
export async function getUoms(): Promise<UnitOfMeasure[]> {
  try {
    const uomCollection = collection(firestore, 'unitsOfMeasure');
    const querySnapshot = await getDocs(uomCollection);
    const uomData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnitOfMeasure));
    return uomData;
  } catch (error) {
    console.error("Error fetching UOMs: ", error);
    return [];
  }
}

/**
 * Fetches all regions from the Firestore database.
 * @returns A promise that resolves to an array of Regions.
 */
export async function getRegions(): Promise<Region[]> {
    try {
      const regionsCollection = collection(firestore, 'regions');
      const querySnapshot = await getDocs(regionsCollection);
      const regionData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Region));
      return regionData;
    } catch (error) {
      console.error("Error fetching regions: ", error);
      return [];
    }
  }

/**
 * Fetches all suppliers from the Firestore database.
 * @returns A promise that resolves to an array of Suppliers.
 */
export async function getSuppliers(): Promise<Supplier[]> {
    try {
        const suppliersCollection = collection(firestore, 'suppliers');
        const querySnapshot = await getDocs(suppliersCollection);
        const suppliersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        return suppliersData;
    } catch (error) {
        console.error("Error fetching suppliers: ", error);
        return [];
    }
}
