import { useState } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Building2,
  MapPin,
  IndianRupee,
  Layers,
  Sparkles,
  LogIn,
} from 'lucide-react';
import type { Property, ListingType, PropertyType, FurnishingType } from '../types';
import type { User as FirebaseUser } from '../lib/firebase';
import { createProperty, updateProperty } from '../lib/propertyService';
import { formatPrice } from '../lib/formatters';

interface PostPropertyModalProps {
  currentUser: FirebaseUser | null;
  initialProperty?: Property | null;
  onClose: () => void;
  onSuccess: (property: Property) => void;
  onOpenAuth: () => void;
}

const DEFAULT_PHOTO_PRESETS = [
  { name: 'Living Room', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Master Bedroom', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Modern Kitchen', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Balcony View', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Gated Society', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Executive PG Room', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80' },
];

const AVAILABLE_AMENITIES = [
  'Covered Parking',
  'Elevator',
  '24x7 Security',
  'Power Backup',
  'Gymnasium',
  'Swimming Pool',
  'Clubhouse',
  'Children Play Area',
  'High Speed WiFi',
  'Food Included',
  'Air Conditioning',
  'Housekeeping',
  'Washing Machine',
  'Piped Gas',
  'Water Purifier',
  'Pet Friendly',
];

export function PostPropertyModal({
  currentUser,
  initialProperty,
  onClose,
  onSuccess,
  onOpenAuth,
}: PostPropertyModalProps) {
  const isEditing = Boolean(initialProperty);

  // Form State
  const [title, setTitle] = useState(initialProperty?.title || '');
  const [listingType, setListingType] = useState<ListingType>(initialProperty?.listingType || 'rent');
  const [propertyType, setPropertyType] = useState<PropertyType>(initialProperty?.propertyType || 'apartment');
  const [description, setDescription] = useState(initialProperty?.description || '');

  // Location
  const [city, setCity] = useState(initialProperty?.city || 'Pune');
  const [locality, setLocality] = useState(initialProperty?.locality || '');
  const [publicAddress, setPublicAddress] = useState(initialProperty?.publicAddress || '');

  // Price & Financials
  const [price, setPrice] = useState<string>(initialProperty ? String(initialProperty.price) : '');
  const [securityDeposit, setSecurityDeposit] = useState<string>(
    initialProperty?.securityDeposit != null ? String(initialProperty.securityDeposit) : ''
  );
  const [maintenanceCharges, setMaintenanceCharges] = useState<string>(
    initialProperty?.maintenanceCharges != null ? String(initialProperty.maintenanceCharges) : ''
  );

  // Property details
  const [bedrooms, setBedrooms] = useState<number>(initialProperty?.bedrooms ?? 2);
  const [bathrooms, setBathrooms] = useState<number>(initialProperty?.bathrooms ?? 2);
  const [furnishing, setFurnishing] = useState<FurnishingType>(initialProperty?.furnishing || 'semi-furnished');
  const [areaSqFt, setAreaSqFt] = useState<string>(initialProperty?.areaSqFt ? String(initialProperty.areaSqFt) : '');
  const [availableFrom, setAvailableFrom] = useState<string>(initialProperty?.availableFrom || 'Immediate');
  const [amenities, setAmenities] = useState<string[]>(initialProperty?.amenities || ['Covered Parking', 'Elevator', '24x7 Security', 'Power Backup']);

  // Photos
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(
    initialProperty?.imageUrls && initialProperty.imageUrls.length > 0
      ? initialProperty.imageUrls
      : [DEFAULT_PHOTO_PRESETS[0].url, DEFAULT_PHOTO_PRESETS[1].url]
  );
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Contact settings
  const [ownerPhone, setOwnerPhone] = useState(initialProperty?.ownerPhone || '');
  const [showContactDirectly, setShowContactDirectly] = useState(initialProperty?.showContactDirectly ?? true);

  // Execution state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      setAmenities(amenities.filter((a) => a !== name));
    } else {
      setAmenities([...amenities, name]);
    }
  };

  const handleAddCustomPhoto = () => {
    if (customPhotoUrl.trim() && !selectedPhotos.includes(customPhotoUrl.trim())) {
      setSelectedPhotos([...selectedPhotos, customPhotoUrl.trim()]);
      setCustomPhotoUrl('');
    }
  };

  const handleRemovePhoto = (url: string) => {
    if (selectedPhotos.length <= 1) {
      setErrorMessage('Please keep at least 1 photo for your property.');
      return;
    }
    setSelectedPhotos(selectedPhotos.filter((p) => p !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setErrorMessage('Please sign in to publish your property listing.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please enter a descriptive property title.');
      return;
    }
    if (!locality.trim()) {
      setErrorMessage('Please specify the neighborhood or locality.');
      return;
    }
    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Please enter a valid price / monthly rent.');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setErrorMessage('Please provide a description with at least 20 characters.');
      return;
    }
    if (selectedPhotos.length === 0) {
      setErrorMessage('Please select or provide at least one photo.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && initialProperty) {
        await updateProperty(initialProperty.id, {
          title: title.trim(),
          listingType,
          propertyType,
          description: description.trim(),
          city,
          locality: locality.trim(),
          publicAddress: publicAddress.trim(),
          price: numPrice,
          securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
          maintenanceCharges: maintenanceCharges ? Number(maintenanceCharges) : 0,
          bedrooms,
          bathrooms,
          furnishing,
          areaSqFt: areaSqFt ? Number(areaSqFt) : undefined,
          availableFrom: availableFrom.trim(),
          amenities,
          imageUrls: selectedPhotos,
          ownerPhone: ownerPhone.trim(),
          showContactDirectly,
        });

        const updated: Property = {
          ...initialProperty,
          title: title.trim(),
          listingType,
          propertyType,
          description: description.trim(),
          city,
          locality: locality.trim(),
          publicAddress: publicAddress.trim(),
          price: numPrice,
          securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
          maintenanceCharges: maintenanceCharges ? Number(maintenanceCharges) : 0,
          bedrooms,
          bathrooms,
          furnishing,
          areaSqFt: areaSqFt ? Number(areaSqFt) : undefined,
          availableFrom: availableFrom.trim(),
          amenities,
          imageUrls: selectedPhotos,
          ownerPhone: ownerPhone.trim(),
          showContactDirectly,
          updatedAt: new Date().toISOString(),
        };
        onSuccess(updated);
      } else {
        const created = await createProperty({
          ownerId: currentUser.uid,
          ownerName: currentUser.displayName || 'Property Owner',
          ownerEmail: currentUser.email || '',
          ownerPhone: ownerPhone.trim() || undefined,
          showContactDirectly,
          title: title.trim(),
          description: description.trim(),
          listingType,
          propertyType,
          city,
          locality: locality.trim(),
          publicAddress: publicAddress.trim(),
          price: numPrice,
          securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
          maintenanceCharges: maintenanceCharges ? Number(maintenanceCharges) : 0,
          bedrooms,
          bathrooms,
          areaSqFt: areaSqFt ? Number(areaSqFt) : undefined,
          furnishing,
          amenities,
          imageUrls: selectedPhotos,
          availableFrom: availableFrom.trim(),
          status: 'active',
          isDemo: false,
        });
        onSuccess(created);
      }
    } catch (err: any) {
      console.error('Error saving property:', err);
      setErrorMessage(
        err?.message?.includes('Missing or insufficient permissions')
          ? 'Permission denied. Please ensure you are logged in.'
          : 'Failed to publish property to database. Please verify inputs and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#faf9f6] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {isEditing ? 'Edit Property Listing' : 'Post Free Property Listing'}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isEditing ? 'Update your listing details in real-time' : 'Connect directly with tenants and buyers across India'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {/* If user is not authenticated, show sign in banner first */}
          {!currentUser && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-950">
                    Sign in required to publish your property
                  </p>
                  <p className="text-xs text-amber-800">
                    Your listing will be linked to your account so you can manage inquiries.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs shrink-0"
              >
                Sign In with Google
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                1. Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Listing Type */}
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Listing Purpose *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['rent', 'sale', 'pg'] as ListingType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setListingType(type)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                          listingType === type
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {type === 'pg' ? 'PG / Coliving' : `For ${type}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Subtype */}
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Property Type *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-800"
                  >
                    <option value="apartment">Apartment / Flat</option>
                    <option value="house">Independent House</option>
                    <option value="villa">Luxury Villa</option>
                    <option value="pg">PG / Co-living Suite</option>
                    <option value="other">Other Residential</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  Property Title Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spacious 2 BHK with Balcony near EON IT Park"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-sm font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your property highlights, nearby metro/schools/IT parks, sunlight, ventilation, and house rules..."
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800 resize-none"
                />
              </div>
            </div>

            {/* 2. Location */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                2. Location Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-800"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Locality / Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Baner, Indiranagar, Bandra West"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  Public Landmark or Address (Optional)
                </label>
                <input
                  type="text"
                  value={publicAddress}
                  onChange={(e) => setPublicAddress(e.target.value)}
                  placeholder="e.g. Near Symbiosis International School, Lane 7"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>

            {/* 3. Pricing */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                3. Pricing & Charges
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    {listingType === 'sale' ? 'Sale Price (INR) *' : 'Monthly Rent (INR) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={listingType === 'sale' ? 'e.g. 15000000' : 'e.g. 30000'}
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:border-emerald-800"
                  />
                  {price && Number(price) > 0 ? (
                    <p className="text-[11px] font-bold text-emerald-800 mt-1">
                      In Words: {formatPrice(Number(price), listingType)}
                    </p>
                  ) : null}
                </div>

                {listingType !== 'sale' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">
                      Security Deposit (INR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                      placeholder="e.g. 60000"
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:border-emerald-800"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Monthly Maintenance (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maintenanceCharges}
                    onChange={(e) => setMaintenanceCharges(e.target.value)}
                    placeholder="0 if included"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* 4. Specifications */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                4. Property Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Bedrooms (BHK)
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-800"
                  >
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-800"
                  >
                    <option value={1}>1 Bathroom</option>
                    <option value={2}>2 Bathrooms</option>
                    <option value={3}>3 Bathrooms</option>
                    <option value={4}>4+ Bathrooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Furnishing
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value as FurnishingType)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-800"
                  >
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Super Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                    placeholder="e.g. 1150"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-semibold text-stone-800"
                  />
                </div>
              </div>

              {/* Amenities Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2">
                  Select Amenities & Features
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABLE_AMENITIES.map((item) => {
                    const isSelected = amenities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className={`p-2 rounded-xl text-xs font-medium text-left flex items-center gap-1.5 transition-all border ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-300 font-semibold'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. Photos */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                5. Property Photos
              </h3>

              <div>
                <p className="text-xs text-stone-500 mb-3">
                  Select representative real estate photos or add your own image URL:
                </p>

                {/* Preset Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                  {DEFAULT_PHOTO_PRESETS.map((preset) => {
                    const isSelected = selectedPhotos.includes(preset.url);
                    return (
                      <div
                        key={preset.name}
                        onClick={() => {
                          if (isSelected) {
                            handleRemovePhoto(preset.url);
                          } else {
                            setSelectedPhotos([...selectedPhotos, preset.url]);
                          }
                        }}
                        className={`relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected ? 'border-emerald-800 ring-2 ring-emerald-800/30' : 'border-stone-200 opacity-60 hover:opacity-90'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-stone-900/70 p-1 text-center">
                          <p className="text-[10px] font-bold text-white truncate">{preset.name}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-800 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Photo URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    placeholder="Paste external image URL (e.g. https://...)"
                    className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPhoto}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold shrink-0"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Contact Preferences */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900">
                6. Contact Preferences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Your Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-6">
                  <input
                    type="checkbox"
                    id="showContactToggle"
                    checked={showContactDirectly}
                    onChange={(e) => setShowContactDirectly(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-emerald-800 focus:ring-emerald-800 cursor-pointer"
                  />
                  <label htmlFor="showContactToggle" className="text-xs font-medium text-stone-700 cursor-pointer">
                    Display my phone directly to interested users
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving Listing...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Publish Property Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
