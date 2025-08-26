
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from './client';
import type { Category, UnitOfMeasure, Region, Supplier, Unit, Ingredient, Dish, Order, MenuDefinition, RationScaleItem } from '@/lib/types';

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

/**
 * Fetches all units from the Firestore database.
 * @returns A promise that resolves to an array of Units.
 */
export async function getUnits(): Promise<Unit[]> {
    try {
        const unitsCollection = collection(firestore, 'units');
        const querySnapshot = await getDocs(unitsCollection);
        const unitsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
        return unitsData;
    } catch (error) {
        console.error("Error fetching units: ", error);
        return [];
    }
}

/**
 * Fetches all ingredients from the Firestore database.
 * @returns A promise that resolves to an array of Ingredients.
 */
export async function getIngredients(): Promise<Ingredient[]> {
    try {
        const ingredientsCollection = collection(firestore, 'ingredients');
        const querySnapshot = await getDocs(ingredientsCollection);
        const ingredientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
        return ingredientsData;
    } catch (error) {
        console.error("Error fetching ingredients: ", error);
        return [];
    }
}

/**
 * Fetches all ration scale items from the Firestore database.
 * @returns A promise that resolves to an array of RationScaleItems.
 */
export async function getRationScale(): Promise<RationScaleItem[]> {
    try {
        const rationScaleCollection = collection(firestore, 'rationScaleItems');
        const querySnapshot = await getDocs(rationScaleCollection);
        const rationScaleData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RationScaleItem));
        return rationScaleData;
    } catch (error) {
        console.error("Error fetching ration scale items: ", error);
        return [];
    }
}


/**
 * Fetches all dishes from the Firestore database.
 * @returns A promise that resolves to an array of Dishes.
 */
export async function getDishes(): Promise<Dish[]> {
    try {
        const dishesCollection = collection(firestore, 'dishes');
        const querySnapshot = await getDocs(dishesCollection);
        const dishesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dish));
        return dishesData;
    } catch (error) {
        console.error("Error fetching dishes: ", error);
        return [];
    }
}

/**
 * Fetches all orders from the Firestore database.
 * @returns A promise that resolves to an array of Orders.
 */
export async function getOrders(): Promise<Order[]> {
    try {
        const ordersCollection = collection(firestore, 'orders');
        const querySnapshot = await getDocs(ordersCollection);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        // Sort by date descending for most recent first
        ordersData.sort((a, b) => new Date(b.dateGenerated).getTime() - new Date(a.dateGenerated).getTime());
        return ordersData;
    } catch (error) {
        console.error("Error fetching orders: ", error);
        return [];
    }
}

/**
 * Fetches a specific menu cycle definition from Firestore.
 * @param day The day of the cycle to fetch (1-28).
 * @returns A promise that resolves to the menu definition or null if not found.
 */
export async function getMenuCycle(day: number): Promise<MenuDefinition | null> {
  try {
    const menuDocRef = doc(firestore, 'menuCycle', String(day));
    const docSnap = await getDoc(menuDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as MenuDefinition;
    }
    console.warn(`No menu document found for day: ${day}`);
    return null;
  } catch (error) {
    console.error(`Error fetching menu for day ${day}:`, error);
    throw error;
  }
}
