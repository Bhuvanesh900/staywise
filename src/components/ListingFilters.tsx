import { useState } from 'react';
import { X, ArrowUpDown, Search, RotateCcw, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react';
import type { FilterState, ListingType } from '../types';

interface ListingFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

const POPULAR_LOCALITY_CHIPS = [
  'All',
  'Baner',
  'Koregaon Park',
  'Wakad',
  'Viman Nagar',
  'Bandra West',
  'Powai',
  'Andheri East',
  'Indiranagar',
  'Koramangala',
  'Whitefield',
];

export function ListingFilters({
  filters,
  onChange,
  onReset,
  totalResults,
}: ListingFiltersProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const isRent = filters.listingType === 'rent';
  const isSale = filters.listingType === 'sale';
  const isPG = filters.listingType === 'pg';

  // Handle switching category tab directly from filter bar
  const handleCategorySwitch = (type: ListingType) => {
    // If switching between rent/pg and sale, reset budget filters to prevent mismatch
    const wasSale = filters.listingType === 'sale';
    const willBeSale = type === 'sale';
    const shouldResetBudget = wasSale !== willBeSale;

    onChange({
      listingType: type,
      ...(shouldResetBudget ? { minPrice: null, maxPrice: null } : {}),
    });
  };

  // Has any active filter beyond defaults?
  const hasActiveFilters =
    filters.city !== 'All Cities' ||
    filters.locality.trim() !== '' ||
    filters.propertyType !== 'all' ||
    filters.bedrooms !== 'all' ||
    filters.furnishing !== 'all' ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.sortBy !== 'newest';

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
      {/* Category Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-1.5 p-1 bg-stone-100/90 rounded-2xl">
          <button
            type="button"
            onClick={() => handleCategorySwitch('rent')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isRent
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            For Rent
          </button>
          <button
            type="button"
            onClick={() => handleCategorySwitch('sale')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isSale
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            Buy Property
          </button>
          <button
            type="button"
            onClick={() => handleCategorySwitch('pg')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isPG
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            PG / Co-living
          </button>
        </div>

        {/* Zero Brokerage Promise Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Paywise Guarantee: Zero Brokerage Fees</span>
        </div>
      </div>

      {/* Top Header & Search bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Locality Search Input */}
        <div className="relative flex-1 max-w-xl">
          <input
            type="text"
            value={filters.locality}
            onChange={(e) => onChange({ locality: e.target.value })}
            placeholder="Search locality, apartment name, landmark..."
            className="w-full pl-9 pr-8 py-2.5 bg-stone-50 hover:bg-stone-100/60 focus:bg-white rounded-xl border border-stone-200 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
          {filters.locality && (
            <button
              onClick={() => onChange({ locality: '' })}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Count & Sort Dropdown */}
        <div className="flex items-center justify-between lg:justify-end gap-3">
          <div className="text-xs text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-900">{totalResults}</span> {isRent ? 'rental homes' : isSale ? 'properties for sale' : 'PG accommodations'}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Locality Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-emerald-800" />
          Hotspots:
        </span>
        {POPULAR_LOCALITY_CHIPS.map((chip) => {
          const isActive = chip === 'All' ? filters.locality === '' : filters.locality.toLowerCase() === chip.toLowerCase();
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onChange({ locality: chip === 'All' ? '' : chip })}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-emerald-900 text-white border-emerald-900 font-bold shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* Filter Controls Row (Desktop & Expanded Mobile) */}
      <div className={`pt-3 border-t border-stone-100 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* City Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-800 cursor-pointer"
            >
              <option value="All Cities">All Cities</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>

          {/* Bedrooms / BHK */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Bedrooms (BHK)
            </label>
            <select
              value={filters.bedrooms}
              onChange={(e) => onChange({ bedrooms: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-800 cursor-pointer"
            >
              <option value="all">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4+">4+ BHK</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Property Type
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => onChange({ propertyType: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-800 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">Independent House</option>
              <option value="villa">Villa</option>
              <option value="pg">PG / Co-living</option>
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Furnishing
            </label>
            <select
              value={filters.furnishing}
              onChange={(e) => onChange({ furnishing: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-800 cursor-pointer"
            >
              <option value="all">Any Furnishing</option>
              <option value="furnished">Fully Furnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>

          {/* Min Budget */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Min Budget
            </label>
            <select
              value={filters.minPrice ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                onChange({ minPrice: val });
              }}
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-800 cursor-pointer"
            >
              <option value="">No Minimum</option>
              {isRent || isPG ? (
                <>
                  <option value="10000">₹10,000 / mo</option>
                  <option value="15000">₹15,000 / mo</option>
                  <option value="25000">₹25,000 / mo</option>
                  <option value="40000">₹40,000 / mo</option>
                  <option value="60000">₹60,000 / mo</option>
                </>
              ) : (
                <>
                  <option value="3000000">₹30 Lakhs</option>
                  <option value="5000000">₹50 Lakhs</option>
                  <option value="10000000">₹1.0 Crore</option>
                  <option value="20000000">₹2.0 Crore</option>
                  <option value="30000000">₹3.0 Crore</option>
                </>
              )}
            </select>
          </div>

          {/* Max Budget */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Max Budget
            </label>
            <select
              value={filters.maxPrice ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                onChange({ maxPrice: val });
              }}
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-800 cursor-pointer"
            >
              <option value="">No Maximum</option>
              {isRent || isPG ? (
                <>
                  <option value="20000">₹20,000 / mo</option>
                  <option value="35000">₹35,000 / mo</option>
                  <option value="50000">₹50,000 / mo</option>
                  <option value="80000">₹80,000 / mo</option>
                  <option value="150000">₹1.5 Lakhs / mo</option>
                </>
              ) : (
                <>
                  <option value="5000000">₹50 Lakhs</option>
                  <option value="10000000">₹1.0 Crore</option>
                  <option value="20000000">₹2.0 Crore</option>
                  <option value="35000000">₹3.5 Crore</option>
                  <option value="50000000">₹5.0 Crore</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Clear Filters Button if any active */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-400 font-medium">Custom filters applied</span>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold hover:text-emerald-950 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
