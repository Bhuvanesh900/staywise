import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { DEMO_PROPERTIES } from './demoData';
import type { Property, Inquiry, InquiryStatus, FilterState, SavedProperty } from '../types';

const PROPERTIES_COLLECTION = 'properties';
const INQUIRIES_COLLECTION = 'inquiries';
const SAVED_PROPERTIES_COLLECTION = 'saved_properties';

/**
 * Ensures demo properties are seeded in Firestore if the collection is empty.
 */
export async function seedDemoPropertiesIfEmpty(): Promise<void> {
  const colRef = collection(db, PROPERTIES_COLLECTION);
  try {
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('Seeding initial demo properties into Firestore...');
      const batch = writeBatch(db);
      for (const prop of DEMO_PROPERTIES) {
        const docRef = doc(db, PROPERTIES_COLLECTION, prop.id);
        batch.set(docRef, prop);
      }
      await batch.commit();
      console.log('Seeded demo properties successfully');
    }
  } catch (error) {
    console.warn('Note on demo seeding:', error);
  }
}

/**
 * Fetch all properties from Firestore and apply filtering in memory.
 * This avoids restrictive Firestore compound query index requirements
 * while supporting multi-parameter search (city, budget, bedrooms, furnishing, etc.).
 */
export async function fetchProperties(filters?: Partial<FilterState>): Promise<Property[]> {
  const colRef = collection(db, PROPERTIES_COLLECTION);
  let allProperties: Property[] = [];

  try {
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      // If collection is still empty in Firestore, return DEMO_PROPERTIES as fallback while seeding happens
      allProperties = [...DEMO_PROPERTIES];
    } else {
      allProperties = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
        } as Property;
      });
    }
  } catch (error) {
    // If permission or network issue, log via error handler
    try {
      handleFirestoreError(error, OperationType.LIST, PROPERTIES_COLLECTION);
    } catch {
      // Return demo properties so UI remains responsive and graceful
      allProperties = [...DEMO_PROPERTIES];
    }
  }

  // Filter and sort in memory
  return filterAndSortProperties(allProperties, filters);
}

export function filterAndSortProperties(properties: Property[], filters?: Partial<FilterState>): Property[] {
  let list = properties.filter((p) => p.status === 'active');

  if (!filters) return list;

  // Listing Type: rent | sale | pg
  if (filters.listingType) {
    list = list.filter((p) => p.listingType === filters.listingType);
  }

  // City
  if (filters.city && filters.city !== 'All Cities') {
    const targetCity = filters.city.trim().toLowerCase();
    list = list.filter((p) => p.city.toLowerCase() === targetCity);
  }

  // Locality or keyword search
  if (filters.locality && filters.locality.trim() !== '') {
    const q = filters.locality.trim().toLowerCase();
    list = list.filter((p) =>
      p.locality.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      (p.publicAddress && p.publicAddress.toLowerCase().includes(q))
    );
  }

  // Property Type
  if (filters.propertyType && filters.propertyType !== 'all') {
    list = list.filter((p) => p.propertyType === filters.propertyType);
  }

  // Bedrooms / BHK
  if (filters.bedrooms && filters.bedrooms !== 'all') {
    if (filters.bedrooms === '4+') {
      list = list.filter((p) => p.bedrooms >= 4);
    } else {
      const bCount = parseInt(filters.bedrooms, 10);
      if (!isNaN(bCount)) {
        list = list.filter((p) => p.bedrooms === bCount);
      }
    }
  }

  // Furnishing
  if (filters.furnishing && filters.furnishing !== 'all') {
    list = list.filter((p) => p.furnishing === filters.furnishing);
  }

  // Budget min & max
  if (filters.minPrice !== null && filters.minPrice !== undefined && filters.minPrice > 0) {
    list = list.filter((p) => p.price >= (filters.minPrice ?? 0));
  }
  if (filters.maxPrice !== null && filters.maxPrice !== undefined && filters.maxPrice > 0) {
    list = list.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
  }

  // Sorting
  if (filters.sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else {
    // Newest first by default
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return list;
}

/**
 * Fetch a single property by ID
 */
export async function fetchPropertyById(id: string): Promise<Property | null> {
  const docRef = doc(db, PROPERTIES_COLLECTION, id);
  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Property;
    }
    // Check fallback demo properties
    const demo = DEMO_PROPERTIES.find((p) => p.id === id);
    return demo || null;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, `${PROPERTIES_COLLECTION}/${id}`);
    } catch {
      const demo = DEMO_PROPERTIES.find((p) => p.id === id);
      return demo || null;
    }
  }
}

/**
 * Create a new property listing in Firestore
 */
export async function createProperty(
  data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Property> {
  const id = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();
  const newProperty: Property = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = doc(db, PROPERTIES_COLLECTION, id);
  try {
    await setDoc(docRef, newProperty);
    return newProperty;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PROPERTIES_COLLECTION}/${id}`);
  }
}

/**
 * Update an existing property in Firestore
 */
export async function updateProperty(
  id: string,
  data: Partial<Property>
): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, id);
  const updatePayload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PROPERTIES_COLLECTION}/${id}`);
  }
}

/**
 * Delete a property listing from Firestore
 */
export async function deleteProperty(id: string): Promise<void> {
  const docRef = doc(db, PROPERTIES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PROPERTIES_COLLECTION}/${id}`);
  }
}

/**
 * Fetch all properties published by a specific owner UID
 */
export async function fetchUserProperties(ownerId: string): Promise<Property[]> {
  const colRef = collection(db, PROPERTIES_COLLECTION);
  const q = query(colRef, where('ownerId', '==', ownerId));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Property[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PROPERTIES_COLLECTION);
  }
}

/**
 * Create an inquiry message sent to a property owner
 */
export async function createInquiry(
  data: Omit<Inquiry, 'id' | 'createdAt'>
): Promise<Inquiry> {
  const id = `inq-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const newInquiry: Inquiry = {
    ...data,
    status: data.status || 'sent',
    id,
    createdAt: new Date().toISOString(),
  };

  const docRef = doc(db, INQUIRIES_COLLECTION, id);
  try {
    await setDoc(docRef, newInquiry);
    return newInquiry;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${INQUIRIES_COLLECTION}/${id}`);
  }
}

/**
 * Fetch inquiries received by a property owner
 */
export async function fetchOwnerInquiries(ownerId: string): Promise<Inquiry[]> {
  const colRef = collection(db, INQUIRIES_COLLECTION);
  const q = query(colRef, where('propertyOwnerId', '==', ownerId));
  try {
    const snapshot = await getDocs(q);
    const inquiries = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Inquiry[];
    // Sort newest inquiries first
    return inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, INQUIRIES_COLLECTION);
  }
}

/**
 * Save a property to user's favorites in Firestore
 */
export async function saveProperty(userId: string, propertyId: string): Promise<SavedProperty> {
  const id = `${userId}_${propertyId}`;
  const savedData: SavedProperty = {
    id,
    userId,
    propertyId,
    createdAt: new Date().toISOString(),
  };

  const docRef = doc(db, SAVED_PROPERTIES_COLLECTION, id);
  try {
    await setDoc(docRef, savedData);
    return savedData;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${SAVED_PROPERTIES_COLLECTION}/${id}`);
  }
}

/**
 * Remove a property from user's favorites in Firestore
 */
export async function unsaveProperty(userId: string, propertyId: string): Promise<void> {
  const id = `${userId}_${propertyId}`;
  const docRef = doc(db, SAVED_PROPERTIES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${SAVED_PROPERTIES_COLLECTION}/${id}`);
  }
}

/**
 * Fetch all saved property records for a user
 */
export async function fetchUserSavedProperties(userId: string): Promise<SavedProperty[]> {
  const colRef = collection(db, SAVED_PROPERTIES_COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as SavedProperty[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SAVED_PROPERTIES_COLLECTION);
  }
}

/**
 * Fetch inquiries that the user sent to property owners
 */
export async function fetchUserSentInquiries(senderUserId: string): Promise<Inquiry[]> {
  const colRef = collection(db, INQUIRIES_COLLECTION);
  const q = query(colRef, where('senderUserId', '==', senderUserId));
  try {
    const snapshot = await getDocs(q);
    const inquiries = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        status: data.status || 'sent',
        ...data,
      } as Inquiry;
    });
    return inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, INQUIRIES_COLLECTION);
  }
}

/**
 * Update the status of an inquiry
 */
export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<void> {
  const docRef = doc(db, INQUIRIES_COLLECTION, inquiryId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${INQUIRIES_COLLECTION}/${inquiryId}`);
  }
}

/**
 * Creates a sample demonstration inquiry for testing the Inquiries dashboard
 */
export async function seedSampleInquiryForUser(
  userId: string,
  userName: string,
  userEmail: string,
  property: Property,
  status: InquiryStatus = 'viewed'
): Promise<Inquiry> {
  return createInquiry({
    propertyId: property.id,
    propertyTitle: property.title,
    propertyOwnerId: property.ownerId,
    senderUserId: userId,
    senderName: userName || 'Valued User',
    senderEmail: userEmail || 'user@example.com',
    senderPhone: '+91 98201 23456',
    message: `Hi ${property.ownerName || 'Owner'}, I am very interested in this property in ${property.locality}, ${property.city}. Is it still available for a visit this weekend?`,
    status,
    propertyCity: property.city,
    propertyLocality: property.locality,
    propertyPrice: property.price,
    propertyListingType: property.listingType,
    propertyImageUrl: property.imageUrls?.[0] || '',
    ownerName: property.ownerName,
    ownerPhone: property.ownerPhone || '',
  });
}


