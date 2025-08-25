
import { db } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Unit } from '@/lib/types';
import { units as placeholderUnits } from '@/lib/placeholder-data';

const unitsCollectionRef = collection(db, 'units');

// Function to get all units from Firestore
export const getUnits = async (): Promise<Unit[]> => {
  const snapshot = await getDocs(unitsCollectionRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
};

// Function to add a new unit to Firestore
export const addUnit = async (unit: Omit<Unit, 'id'>): Promise<string> => {
  const docRef = await addDoc(unitsCollectionRef, unit);
  return docRef.id;
};

// Function to update an existing unit in Firestore
export const updateUnit = async (id: string, unit: Partial<Unit>): Promise<void> => {
  const unitDoc = doc(db, 'units', id);
  await updateDoc(unitDoc, unit);
};

// Function to delete a unit from Firestore
export const deleteUnit = async (id: string): Promise<void> => {
  const unitDoc = doc(db, 'units', id);
  await deleteDoc(unitDoc);
};

// Function to seed placeholder data into Firestore
export const seedUnits = async (): Promise<void> => {
  const currentUnits = await getUnits();
  if (currentUnits.length > 0) {
    console.log("Units collection already has data. Seeding skipped.");
    return;
  }

  console.log("Seeding units...");
  const batch = writeBatch(db);
  placeholderUnits.forEach(unit => {
    // We can't know the ID beforehand, so we let Firestore generate it
    const { id, ...unitData } = unit;
    const docRef = doc(collection(db, "units")); // Create a new doc with a generated id
    batch.set(docRef, unitData);
  });

  await batch.commit();
  console.log("Seeding complete.");
};
