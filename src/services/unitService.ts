
import { db } from '@/lib/firebase/client';
import type { Unit } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

const UNITS_COLLECTION = 'units';

// Get all units from Firestore
export const getUnits = async (): Promise<Unit[]> => {
  const unitsCollection = collection(db, UNITS_COLLECTION);
  const q = query(unitsCollection, orderBy('unit'), orderBy('mess'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Unit[];
};

// Add a new unit to Firestore
export const addUnit = async (unit: Omit<Unit, 'id'>): Promise<string> => {
  const unitsCollection = collection(db, UNITS_COLLECTION);
  const docRef = await addDoc(unitsCollection, unit);
  return docRef.id;
};

// Update an existing unit in Firestore
export const updateUnit = async (id: string, unit: Partial<Unit>): Promise<void> => {
  const unitDoc = doc(db, UNITS_COLLECTION, id);
  // Make sure not to update the id field itself
  const { id: _, ...dataToUpdate } = unit;
  await updateDoc(unitDoc, dataToUpdate);
};

// Delete a unit from Firestore
export const deleteUnit = async (id: string): Promise<void> => {
  const unitDoc = doc(db, UNITS_COLLECTION, id);
  await deleteDoc(unitDoc);
};
