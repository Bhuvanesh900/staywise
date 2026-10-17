import { useState } from 'react';
import { Search, MapPin, Building, ShieldCheck, Zap } from 'lucide-react';
import type { ListingType } from '../types';
import { POPULAR_CITIES } from '../lib/demoData';

interface SearchHeroProps {
  onSearch: (listingType: ListingType, city: string, locality: string) => void;
  onSelectCity: (city: string) => void;
}

export function SearchHero({ onSearch, onSelectCity }: SearchHeroProps) {
  const [activeTab, setActiveTab] = useState<ListingType>('rent');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [localityQuery, setLocalityQuery] = useState<string>('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(activeTab, selectedCity === 'All Cities' ? '' : selectedCity, localityQuery);
  };

  return (
    <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 left-10 w-80 h-80 bg-stone-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and Search Panel */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Direct Property Connections • Zero Brokerage</span>
            </div>

            {/* Headline & Subtext */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.12]">
                Staywise means <br />
                <span className="text-emerald-900">Paywise!</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-600 max-w-xl font-normal leading-relaxed">
                Zero brokerage. Transparent direct-owner pricing. Save 1 to 2 months of rent in middleman commissions across Pune, Mumbai, Bengaluru, and other major hubs.
              </p>
            </div>

            {/* Modern Search Box */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-stone-200/90 max-w-2xl">
              {/* Type Switcher Tabs */}
              <div className="flex items-center space-x-1.5 p-1 bg-stone-100/90 rounded-2xl w-fit mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('rent')}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'rent'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Rent
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sale')}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'sale'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pg')}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'pg'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  PG / Co-living
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* City Selector */}
                  <div className="sm:col-span-5 relative">
                    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1 ml-1">
                      City
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full pl-9 pr-8 py-3 bg-stone-50 hover:bg-stone-100/80 focus:bg-white rounded-xl border border-stone-200 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all cursor-pointer appearance-none"
                      >
                        <option value="All Cities">All Indian Cities</option>
                        <option value="Pune">Pune</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Chennai">Chennai</option>
                      </select>
                      <MapPin className="w-4 h-4 text-emerald-800 absolute left-3 top-3.5 pointer-events-none" />
                      <div className="absolute right-3 top-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-stone-400 w-0 h-0" />
                    </div>
                  </div>

                  {/* Locality or Keyword search */}
                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1 ml-1">
                      Locality or Landmark
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={localityQuery}
                        onChange={(e) => setLocalityQuery(e.target.value)}
                        placeholder="e.g. Baner, Bandra, Indiranagar, Hinjewadi..."
                        className="w-full pl-9 pr-4 py-3 bg-stone-50 hover:bg-stone-100/80 focus:bg-white rounded-xl border border-stone-200 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
                      />
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search {activeTab === 'rent' ? 'Rental Homes' : activeTab === 'sale' ? 'Properties to Buy' : 'PG Accommodations'}</span>
                </button>
              </form>
            </div>

            {/* Micro value props */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-stone-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Direct Owners</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-700" />
                <span>100% Genuine Listings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-700" />
                <span>Zero Middlemen Fees</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Primary image with soft frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/5 bg-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern residence living space"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />

                {/* Floating pill: Direct Connection */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Staywise Promise
                      </p>
                      <p className="text-sm font-bold text-stone-900">
                        Chat directly with home owners
                      </p>
                    </div>
                    <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      0%
                    </span>
                  </div>
                </div>
              </div>

              {/* Small accent card on top right */}
              <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-3 p-3.5 bg-white rounded-2xl shadow-xl border border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Pune • Mumbai • BLR</p>
                  <p className="text-[11px] text-stone-500 font-medium">Top metro locations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Cities Row */}
        <div className="mt-16 pt-10 border-t border-stone-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Explore Popular Cities</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Browse verified properties in top Indian real estate hubs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => onSelectCity(city.name)}
                className="group relative p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-emerald-800 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div className="aspect-16/10 rounded-xl overflow-hidden mb-2.5 bg-stone-100">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                    {city.name}
                  </p>
                  <p className="text-[11px] text-stone-400 font-medium">{city.count}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
