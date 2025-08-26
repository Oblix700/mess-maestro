




import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy } from 'firebase/firestore';
import { firestore } from './client';
import type { Category, UnitOfMeasure, Region, Supplier, Unit, Ingredient, Dish, Order, MenuDefinition, RationScaleItem, MonthlyStrength, User } from '@/lib/types';

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
    const q = query(categoriesCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);
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
    const q = query(uomCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);
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
      const q = query(regionsCollection, orderBy('name'));
      const querySnapshot = await getDocs(q);
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
        const q = query(suppliersCollection, orderBy('name'));
        const querySnapshot = await getDocs(q);
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
        const q = query(unitsCollection, orderBy('name'));
        const querySnapshot = await getDocs(q);
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
        const q = query(ingredientsCollection, orderBy('name'));
        const querySnapshot = await getDocs(q);
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
        const q = query(rationScaleCollection, orderBy('name'));
        const querySnapshot = await getDocs(q);
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
        const q = query(dishesCollection, orderBy('name'));
        const querySnapshot = await getDocs(q);
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
        const q = query(ordersCollection, orderBy('orderDate', 'desc'));
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
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

/**
 * Fetches the strength data for a specific unit and month from Firestore.
 * @param unitId The ID of the unit.
 * @param year The year.
 * @param month The month (0-11).
 * @returns A promise that resolves to the monthly strength data or null if not found.
 */
export async function getStrengthForMonth(unitId: string, year: number, month: number): Promise<MonthlyStrength | null> {
    const docId = `${unitId}_${year}_${month}`;
    try {
        const strengthDocRef = doc(firestore, 'strengths', docId);
        const docSnap = await getDoc(strengthDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as MonthlyStrength;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching strength data for ${docId}:`, error);
        throw error;
    }
}

/**
 * Saves the strength data for a specific unit and month to Firestore.
 * @param data The monthly strength data to save.
 * @returns A promise that resolves when the save is complete.
 */
export async function saveStrengthForMonth(data: MonthlyStrength): Promise<void> {
    const docId = `${data.unitId}_${data.year}_${data.month}`;
    try {
        const strengthDocRef = doc(firestore, 'strengths', docId);
        // We use setDoc with merge: true to avoid overwriting the whole document
        // if only a few days are changed. This also creates the document if it doesn't exist.
        await setDoc(strengthDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error saving strength data for ${docId}:`, error);
        throw error;
    }
}


/**
 * Fetches all users from the Firestore database.
 * @returns A promise that resolves to an array of Users.
 */
export async function getUsers(): Promise<User[]> {
    try {
        const usersCollection = collection(firestore, 'users');
        const q = query(usersCollection, orderBy('name'));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        return usersData;
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
}
