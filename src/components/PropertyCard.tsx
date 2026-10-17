import { Bed, Bath, Maximize2, MapPin, Sparkles, Heart } from 'lucide-react';
import type { Property } from '../types';
import { formatPrice, formatBHK, formatFurnishing } from '../lib/formatters';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  isSaved?: boolean;
  onToggleSave?: (propertyId: string, e: React.MouseEvent) => void;
}

export function PropertyCard({ property, onSelect, isSaved = false, onToggleSave }: PropertyCardProps) {
  const listingTypeBadge = {
    rent: { text: 'For Rent', bg: 'bg-emerald-950/80 text-emerald-100' },
    sale: { text: 'For Sale', bg: 'bg-stone-900/80 text-stone-100' },
    pg: { text: 'PG / Co-living', bg: 'bg-teal-900/80 text-teal-100' },
  }[property.listingType] || { text: property.listingType, bg: 'bg-stone-800 text-white' };

  const mainImage = property.imageUrls && property.imageUrls.length > 0
    ? property.imageUrls[0]
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={() => onSelect(property)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-stone-300 transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        <img
          src={mainImage}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Top badges & Wishlist Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg backdrop-blur-md shadow-xs ${listingTypeBadge.bg}`}
            >
              {listingTypeBadge.text}
            </span>

            {property.isDemo && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.8 text-[11px] font-semibold bg-amber-500/90 text-amber-950 backdrop-blur-md rounded-lg shadow-xs">
                <Sparkles className="w-3 h-3" />
                Demo Listing
              </span>
            )}
          </div>

          {/* Heart / Wishlist action button */}
          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(property.id, e);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-90 ${
                isSaved
                  ? 'bg-white/95 text-rose-500 ring-2 ring-rose-500/30'
                  : 'bg-stone-900/40 text-white hover:bg-white hover:text-rose-500'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save property'}
              title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-4.5 h-4.5 transition-transform ${isSaved ? 'fill-rose-500 scale-105' : 'stroke-[2.2]'}`} />
            </button>
          )}
        </div>

        {/* Price overlay pill on bottom left of image */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <div className="px-3 py-1.5 bg-stone-900/85 backdrop-blur-md rounded-xl text-white font-bold text-base tracking-tight shadow-md">
            {formatPrice(property.price, property.listingType)}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div>
          {/* Location */}
          <div className="flex items-center text-xs font-medium text-stone-500 gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span className="truncate">
              {property.locality}, {property.city}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-900 transition-colors">
            {property.title}
          </h3>
        </div>

        {/* Key specs pills */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5" title="Bedrooms">
            <Bed className="w-4 h-4 text-stone-400" />
            <span className="font-medium">{formatBHK(property.bedrooms, property.propertyType)}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Bathrooms">
            <Bath className="w-4 h-4 text-stone-400" />
            <span className="font-medium">{property.bathrooms} Bath</span>
          </div>

          {property.areaSqFt ? (
            <div className="flex items-center gap-1.5" title="Area">
              <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium">{property.areaSqFt} sq.ft</span>
            </div>
          ) : (
            <span className="font-medium text-stone-500 text-[11px] capitalize">
              {formatFurnishing(property.furnishing)}
            </span>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-stone-400 font-medium">
            Direct Owner • No Brokerage
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(property);
            }}
            className="text-xs font-semibold text-emerald-900 group-hover:text-emerald-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
