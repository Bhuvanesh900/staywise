import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SearchHero } from './components/SearchHero';
import { ListingFilters } from './components/ListingFilters';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PostPropertyModal } from './components/PostPropertyModal';
import { MyPropertiesView } from './components/MyPropertiesView';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import {
  auth,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from './lib/firebase';
import {
  fetchProperties,
  seedDemoPropertiesIfEmpty,
  fetchUserProperties,
  saveProperty,
  unsaveProperty,
  fetchUserSavedProperties,
} from './lib/propertyService';
import type { Property, FilterState, ListingType } from './types';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Navigation
  const [currentTab, setCurrentTab] = useState<'home' | ListingType | 'my-properties'>('home');
  const [dashboardTab, setDashboardTab] = useState<'listings' | 'saved' | 'my-inquiries' | 'inquiries'>('my-inquiries');

  // Listings data
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [userPropertiesCount, setUserPropertiesCount] = useState(0);

  // Saved / Wishlisted Properties
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    listingType: 'rent',
    city: 'All Cities',
    locality: '',
    propertyType: 'all',
    bedrooms: 'all',
    furnishing: 'all',
    minPrice: null,
    maxPrice: null,
    sortBy: 'newest',
  });

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Listen to Auth State and load user-specific properties and saved wishlist
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
      if (user) {
        try {
          const [userProps, userSaved] = await Promise.all([
            fetchUserProperties(user.uid),
            fetchUserSavedProperties(user.uid),
          ]);
          setUserPropertiesCount(userProps.length);
          setSavedPropertyIds(userSaved.map((s) => s.propertyId));
        } catch (err) {
          console.error('Error fetching user dashboard data:', err);
          setUserPropertiesCount(0);
          setSavedPropertyIds([]);
        }
      } else {
        setUserPropertiesCount(0);
        setSavedPropertyIds([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initial Seed & Fetch properties
  const loadDatabaseProperties = useCallback(async () => {
    setIsLoadingProperties(true);
    try {
      // Ensure initial demo properties exist in Firestore
      await seedDemoPropertiesIfEmpty();
      const list = await fetchProperties();
      setAllProperties(list);
    } catch (err) {
      console.error('Failed to load database properties:', err);
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseProperties();
  }, [loadDatabaseProperties]);

  // Handle URL Hash for direct property links (e.g. #property/123)
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#property/')) {
        const propId = hash.replace('#property/', '');
        const target = allProperties.find((p) => p.id === propId);
        if (target) {
          setSelectedProperty(target);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [allProperties]);

  // Update hash when property modal opens/closes
  const handleSelectProperty = (prop: Property) => {
    setSelectedProperty(prop);
    window.location.hash = `property/${prop.id}`;
  };

  const handleClosePropertyModal = () => {
    setSelectedProperty(null);
    if (window.location.hash.startsWith('#property/')) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Toggle Save / Wishlist handler
  const handleToggleSave = async (propertyId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const isAlreadySaved = savedPropertyIds.includes(propertyId);
    if (isAlreadySaved) {
      // Optimistic remove
      setSavedPropertyIds((prev) => prev.filter((id) => id !== propertyId));
      showToast('Removed from Saved Wishlist');
      try {
        await unsaveProperty(currentUser.uid, propertyId);
      } catch (err) {
        console.error('Failed to unsave property:', err);
        // Rollback
        setSavedPropertyIds((prev) => [...prev, propertyId]);
        showToast('Could not update saved properties.');
      }
    } else {
      // Optimistic add
      setSavedPropertyIds((prev) => [...prev, propertyId]);
      showToast('Added to your Saved Wishlist!');
      try {
        await saveProperty(currentUser.uid, propertyId);
      } catch (err) {
        console.error('Failed to save property:', err);
        // Rollback
        setSavedPropertyIds((prev) => prev.filter((id) => id !== propertyId));
        showToast('Could not update saved properties.');
      }
    }
  };

  // Switch navigation tabs
  const handleNavigate = (
    tab: 'home' | ListingType | 'my-properties',
    subTab?: 'listings' | 'saved' | 'my-inquiries' | 'inquiries'
  ) => {
    setCurrentTab(tab);
    if (subTab) {
      setDashboardTab(subTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tab === 'rent' || tab === 'sale' || tab === 'pg') {
      setFilters((prev) => ({
        ...prev,
        listingType: tab,
      }));
    }
  };

  // Search submit from Homepage Hero
  const handleHeroSearch = (type: ListingType, city: string, locality: string) => {
    setFilters((prev) => ({
      ...prev,
      listingType: type,
      city: city || 'All Cities',
      locality: locality || '',
    }));
    setCurrentTab(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // City click from Popular Cities
  const handleSelectCity = (city: string) => {
    setFilters((prev) => ({
      ...prev,
      city,
    }));
    if (currentTab === 'home') {
      setCurrentTab('rent');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter updates
  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      listingType: (currentTab === 'home' || currentTab === 'my-properties') ? 'rent' : currentTab,
      city: 'All Cities',
      locality: '',
      propertyType: 'all',
      bedrooms: 'all',
      furnishing: 'all',
      minPrice: null,
      maxPrice: null,
      sortBy: 'newest',
    });
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSavedPropertyIds([]);
      if (currentTab === 'my-properties') {
        setCurrentTab('home');
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Property Post / Edit Success
  const handlePropertySaved = (savedProp: Property) => {
    setIsPostModalOpen(false);
    setEditingProperty(null);
    loadDatabaseProperties();

    // Show the newly published or edited property right away
    setSelectedProperty(savedProp);

    // Update user properties counter
    if (currentUser) {
      fetchUserProperties(currentUser.uid).then((props) => {
        setUserPropertiesCount(props.length);
      });
    }
  };

  // Filtered Properties for listing views
  const filteredListings = useMemo(() => {
    let list = allProperties.filter((p) => p.status === 'active');

    // Filter by type
    if (currentTab !== 'home' && currentTab !== 'my-properties') {
      list = list.filter((p) => p.listingType === currentTab);
    } else if (filters.listingType) {
      list = list.filter((p) => p.listingType === filters.listingType);
    }

    // City
    if (filters.city && filters.city !== 'All Cities') {
      const target = filters.city.toLowerCase().trim();
      list = list.filter((p) => p.city.toLowerCase() === target);
    }

    // Locality
    if (filters.locality && filters.locality.trim() !== '') {
      const q = filters.locality.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.locality.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (p.publicAddress && p.publicAddress.toLowerCase().includes(q))
      );
    }

    // Bedrooms
    if (filters.bedrooms && filters.bedrooms !== 'all') {
      if (filters.bedrooms === '4+') {
        list = list.filter((p) => p.bedrooms >= 4);
      } else {
        const count = parseInt(filters.bedrooms, 10);
        if (!isNaN(count)) {
          list = list.filter((p) => p.bedrooms === count);
        }
      }
    }

    // Property Type
    if (filters.propertyType && filters.propertyType !== 'all') {
      list = list.filter((p) => p.propertyType === filters.propertyType);
    }

    // Furnishing
    if (filters.furnishing && filters.furnishing !== 'all') {
      list = list.filter((p) => p.furnishing === filters.furnishing);
    }

    // Min & Max Price
    if (filters.minPrice !== null && filters.minPrice > 0) {
      list = list.filter((p) => p.price >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== null && filters.maxPrice > 0) {
      list = list.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
    }

    // Sorting
    if (filters.sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.price - a.price);
    } else {
      return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [allProperties, currentTab, filters]);

  // Featured properties for homepage (first 6 active listings)
  const featuredProperties = useMemo(() => {
    return allProperties.filter((p) => p.status === 'active').slice(0, 6);
  }, [allProperties]);

  // List of all saved Property objects
  const savedPropertiesList = useMemo(() => {
    return allProperties.filter((p) => savedPropertyIds.includes(p.id));
  }, [allProperties, savedPropertyIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenPostProperty={() => {
          setEditingProperty(null);
          setIsPostModalOpen(true);
        }}
        onSignOut={handleSignOut}
        userPropertiesCount={userPropertiesCount}
        savedPropertiesCount={savedPropertyIds.length}
      />

      {/* Main Body */}
      <main className="flex-1">
        {currentTab === 'my-properties' ? (
          /* User Dashboard */
          currentUser ? (
            <MyPropertiesView
              currentUser={currentUser}
              savedProperties={savedPropertiesList}
              allProperties={allProperties}
              initialTab={dashboardTab}
              onOpenPostProperty={() => {
                setEditingProperty(null);
                setIsPostModalOpen(true);
              }}
              onEditProperty={(prop) => {
                setEditingProperty(prop);
                setIsPostModalOpen(true);
              }}
              onSelectProperty={handleSelectProperty}
              onToggleSave={handleToggleSave}
              onExploreProperties={() => handleNavigate('rent')}
            />
          ) : (
            <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
              <h2 className="text-2xl font-bold text-stone-900">Sign in to view your properties & wishlist</h2>
              <p className="text-xs text-stone-500">
                You must be logged in to manage your listings, view saved favorites, and review inquiries.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow-md"
              >
                Sign In with Google
              </button>
            </div>
          )
        ) : currentTab === 'home' ? (
          /* HOMEPAGE */
          <div>
            {/* Hero & Search */}
            <SearchHero
              onSearch={handleHeroSearch}
              onSelectCity={handleSelectCity}
            />

            {/* Featured Properties Section */}
            <section className="py-16 bg-white border-y border-stone-200/80">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Curated Selections</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                      Featured Properties
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                      Direct owner listings across Pune, Mumbai, and Bengaluru
                    </p>
                  </div>

                  <button
                    onClick={() => handleNavigate('rent')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-700 transition-colors self-start sm:self-auto"
                  >
                    <span>Browse All Properties</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {isLoadingProperties ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-stone-400 font-medium">Fetching verified properties...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {featuredProperties.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={handleSelectProperty}
                        isSaved={savedPropertyIds.includes(prop.id)}
                        onToggleSave={handleToggleSave}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* How Staywise Works */}
            <section className="py-20 bg-[#faf9f6]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
                <div className="max-w-2xl mx-auto space-y-3">
                  <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                    How Staywise Works
                  </h2>
                  <p className="text-sm text-stone-600">
                    Transparent, straightforward, and zero brokerage. We make finding or listing a home effortless.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  {/* Step 1 */}
                  <div className="bg-white p-7 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-lg flex items-center justify-center">
                      1
                    </div>
                    <h3 className="font-bold text-stone-900 text-lg">Find Properties</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Search apartments, houses, villas, and PGs across prime Indian localities with detailed filters for price, furnishing, and BHK configuration.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white p-7 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-lg flex items-center justify-center">
                      2
                    </div>
                    <h3 className="font-bold text-stone-900 text-lg">Explore the Details</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      View genuine property photos, security deposit details, exact maintenance charges, society amenities, and verified locality information.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white p-7 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-lg flex items-center justify-center">
                      3
                    </div>
                    <h3 className="font-bold text-stone-900 text-lg">Connect with the Owner</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Contact individual property owners directly without brokers or hidden commissions. Schedule visits directly and finalize terms on your own schedule.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Property Owner CTA Section */}
            <section className="py-16 bg-emerald-950 text-white relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900 text-emerald-200 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>For Individual Owners & Society Members</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      Have a property to list?
                    </h2>
                    <p className="text-sm sm:text-base text-emerald-200/90 max-w-xl font-normal leading-relaxed">
                      Reach people looking for their next home. Free listing, zero brokerage, and direct tenant inquiries delivered to your dashboard.
                    </p>
                  </div>

                  <div className="lg:col-span-4 flex lg:justify-end">
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setIsPostModalOpen(true);
                      }}
                      className="px-7 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-sm shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2 group"
                    >
                      <span>Post Your Property</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* PROPERTY LISTINGS VIEW (Rent, Buy, PG) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Category Header */}
            <div className="mb-6 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>
                  {currentTab === 'rent'
                    ? 'Rental Properties'
                    : currentTab === 'sale'
                    ? 'Properties for Sale'
                    : 'PG & Co-Living Spaces'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {currentTab === 'rent'
                  ? 'Find Homes for Rent in India'
                  : currentTab === 'sale'
                  ? 'Discover Properties for Sale'
                  : 'Executive PG & Shared Accommodations'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                Direct connections with genuine property owners. 100% verified listings.
              </p>
            </div>

            {/* Filter Panel */}
            <ListingFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              totalResults={filteredListings.length}
            />

            {/* Listings Grid */}
            {isLoadingProperties ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-9 h-9 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-500 font-medium">Loading properties from database...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-stone-200/90 p-10 sm:p-16 text-center max-w-lg mx-auto space-y-4 my-8">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">No properties matched your criteria</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Try adjusting your budget range, selected city, or bedroom filters to see more available listings.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={loadDatabaseProperties}
                    className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredListings.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onSelect={handleSelectProperty}
                    isSaved={savedPropertyIds.includes(prop.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          currentUser={currentUser}
          isSaved={savedPropertyIds.includes(selectedProperty.id)}
          onToggleSave={(propId) => handleToggleSave(propId)}
          onClose={handleClosePropertyModal}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Post / Edit Property Modal */}
      {isPostModalOpen && (
        <PostPropertyModal
          currentUser={currentUser}
          initialProperty={editingProperty}
          onClose={() => {
            setIsPostModalOpen(false);
            setEditingProperty(null);
          }}
          onSuccess={handlePropertySaved}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
          }}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPostProperty={() => {
          setEditingProperty(null);
          setIsPostModalOpen(true);
        }}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-stone-800 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
