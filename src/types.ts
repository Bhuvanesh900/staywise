export type ListingType = 'rent' | 'sale' | 'pg';
export type PropertyType = 'apartment' | 'house' | 'villa' | 'pg' | 'other';
export type FurnishingType = 'furnished' | 'semi-furnished' | 'unfurnished';
export type ListingStatus = 'active' | 'inactive' | 'archived';

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  showContactDirectly?: boolean;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  city: string;
  locality: string;
  publicAddress?: string;
  price: number;
  securityDeposit?: number;
  maintenanceCharges?: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt?: number;
  furnishing: FurnishingType;
  amenities: string[];
  imageUrls: string[];
  availableFrom?: string;
  status: ListingStatus;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStatus = 'sent' | 'viewed' | 'replied' | 'pending' | 'closed';

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyOwnerId: string;
  senderUserId?: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  status?: InquiryStatus;
  createdAt: string;
  propertyCity?: string;
  propertyLocality?: string;
  propertyPrice?: number;
  propertyListingType?: ListingType;
  propertyImageUrl?: string;
  ownerName?: string;
  ownerPhone?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface SavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface FilterState {
  listingType: ListingType;
  city: string;
  locality: string;
  propertyType: string;
  bedrooms: string;
  furnishing: string;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: 'newest' | 'price_asc' | 'price_desc';
}
