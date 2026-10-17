import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  MessageSquare,
  Building,
  MapPin,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Heart,
  Compass,
  Send,
  Eye,
  CheckCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Check,
} from 'lucide-react';
import type { Property, Inquiry, InquiryStatus } from '../types';
import type { User as FirebaseUser } from '../lib/firebase';
import {
  fetchUserProperties,
  deleteProperty,
  fetchOwnerInquiries,
  fetchUserSentInquiries,
  updateInquiryStatus,
  seedSampleInquiryForUser,
} from '../lib/propertyService';
import { formatPrice, formatBHK } from '../lib/formatters';
import { PropertyCard } from './PropertyCard';

interface MyPropertiesViewProps {
  currentUser: FirebaseUser;
  savedProperties: Property[];
  allProperties?: Property[];
  initialTab?: 'listings' | 'saved' | 'my-inquiries' | 'inquiries';
  onOpenPostProperty: () => void;
  onEditProperty: (property: Property) => void;
  onSelectProperty: (property: Property) => void;
  onToggleSave: (propertyId: string, e: React.MouseEvent) => void;
  onExploreProperties: () => void;
}

export function MyPropertiesView({
  currentUser,
  savedProperties,
  allProperties = [],
  initialTab = 'listings',
  onOpenPostProperty,
  onEditProperty,
  onSelectProperty,
  onToggleSave,
  onExploreProperties,
}: MyPropertiesViewProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [sentInquiries, setSentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'my-inquiries' | 'inquiries'>(initialTab);

  // Status filter for sent inquiries
  const [sentStatusFilter, setSentStatusFilter] = useState<'all' | InquiryStatus>('all');

  // Deletion modal state
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSeedingSample, setIsSeedingSample] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userProps, ownerInqs, userSentInqs] = await Promise.all([
        fetchUserProperties(currentUser.uid),
        fetchOwnerInquiries(currentUser.uid),
        fetchUserSentInquiries(currentUser.uid),
      ]);
      setProperties(userProps);
      setInquiries(ownerInqs);
      setSentInquiries(userSentInqs);
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.uid]);

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProperty(propertyToDelete.id);
      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
      setStatusMessage('Property listing removed successfully.');
      setTimeout(() => setStatusMessage(null), 3500);
      setPropertyToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Could not delete property. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Update inquiry status
  const handleUpdateInquiryStatus = async (
    inquiryId: string,
    newStatus: InquiryStatus,
    isReceivedTab: boolean
  ) => {
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      if (isReceivedTab) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
        );
      } else {
        setSentInquiries((prev) =>
          prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
        );
      }
      setStatusMessage(`Inquiry marked as "${newStatus}".`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      alert('Could not update status. Please try again.');
    }
  };

  // Seed sample inquiry to test
  const handleAddSampleInquiry = async () => {
    const candidateProp = allProperties.find((p) => p.ownerId !== currentUser.uid) || allProperties[0];
    if (!candidateProp) {
      alert('No properties available to create a sample inquiry.');
      return;
    }
    setIsSeedingSample(true);
    try {
      const sample = await seedSampleInquiryForUser(
        currentUser.uid,
        currentUser.displayName || 'Demo Buyer',
        currentUser.email || 'buyer@staywise.in',
        candidateProp,
        'viewed'
      );
      setSentInquiries((prev) => [sample, ...prev]);
      setStatusMessage('Sample property inquiry created to demonstrate status tracking!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to seed sample inquiry:', err);
    } finally {
      setIsSeedingSample(false);
    }
  };

  // Filtered sent inquiries
  const filteredSentInquiries = sentInquiries.filter((inq) => {
    if (sentStatusFilter === 'all') return true;
    return inq.status === sentStatusFilter;
  });

  // Helper for status badge rendering
  const renderStatusBadge = (status?: InquiryStatus) => {
    switch (status) {
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Owner Replied</span>
          </span>
        );
      case 'viewed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs">
            <Eye className="w-3.5 h-3.5" />
            <span>Viewed by Owner</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-300">
            <Check className="w-3.5 h-3.5" />
            <span>Inquiry Closed</span>
          </span>
        );
      case 'sent':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
            <Send className="w-3.5 h-3.5" />
            <span>Inquiry Sent</span>
          </span>
        );
    }
  };

  // Helper for status description
  const getStatusDescription = (status?: InquiryStatus) => {
    switch (status) {
      case 'replied':
        return 'The property owner has responded or reached out regarding your inquiry.';
      case 'viewed':
        return 'The property owner has viewed your inquiry message and contact details.';
      case 'pending':
        return 'The property owner has acknowledged your request and is reviewing it.';
      case 'closed':
        return 'This inquiry conversation has been completed or marked as closed.';
      case 'sent':
      default:
        return 'Your message was successfully delivered to the property owner. Awaiting first view.';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            User Dashboard & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Track properties you've inquired about, manage your published listings, and check wishlisted homes
          </p>
        </div>

        <button
          onClick={onOpenPostProperty}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Post Another Property</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 border-b border-stone-200 mb-8 overflow-x-auto pb-1">
        {/* Properties Inquired About Tab - USER'S SENT INQUIRIES */}
        <button
          onClick={() => setActiveTab('my-inquiries')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'my-inquiries'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Properties Inquired About ({sentInquiries.length})</span>
          {sentInquiries.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-extrabold flex items-center justify-center">
              {sentInquiries.length}
            </span>
          )}
        </button>

        {/* My Published Listings */}
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'listings'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>My Listings ({properties.length})</span>
        </button>

        {/* Saved Properties / Wishlist */}
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'saved'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === 'saved' ? 'fill-rose-500' : ''}`} />
          <span>Saved Properties ({savedProperties.length})</span>
          {savedProperties.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold flex items-center justify-center">
              {savedProperties.length}
            </span>
          )}
        </button>

        {/* Received Inquiries (From other users on published listings) */}
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'inquiries'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Received Inquiries ({inquiries.length})</span>
          {inquiries.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-extrabold flex items-center justify-center">
              {inquiries.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-500">Loading your account data...</p>
        </div>
      ) : activeTab === 'my-inquiries' ? (
        /* PROPERTIES INQUIRED ABOUT TAB */
        <div className="space-y-6">
          {/* Header & Status Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <span>Inquired Properties</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                  {sentInquiries.length} {sentInquiries.length === 1 ? 'total inquiry' : 'total inquiries'}
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Monitor the status of your direct inquiries to property owners across India
              </p>
            </div>

            {/* Status Filter Buttons */}
            {sentInquiries.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <span className="text-stone-400 mr-1 text-[11px] uppercase tracking-wider font-bold">Filter:</span>
                <button
                  onClick={() => setSentStatusFilter('all')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    sentStatusFilter === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All ({sentInquiries.length})
                </button>
                <button
                  onClick={() => setSentStatusFilter('sent')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    sentStatusFilter === 'sent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Sent ({sentInquiries.filter((i) => !i.status || i.status === 'sent').length})
                </button>
                <button
                  onClick={() => setSentStatusFilter('viewed')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    sentStatusFilter === 'viewed'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Viewed ({sentInquiries.filter((i) => i.status === 'viewed').length})
                </button>
                <button
                  onClick={() => setSentStatusFilter('replied')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    sentStatusFilter === 'replied'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Replied ({sentInquiries.filter((i) => i.status === 'replied').length})
                </button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {sentInquiries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-14 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">No property inquiries sent yet</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                When you discover a home, apartment, or PG you like, click <span className="font-semibold text-stone-800">"Contact Owner Directly"</span> on the property page. All your inquiries and their real-time statuses will appear right here.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={onExploreProperties}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Properties</span>
                </button>

                <button
                  onClick={handleAddSampleInquiry}
                  disabled={isSeedingSample}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isSeedingSample ? 'Creating Sample...' : 'Try Demo Inquiry'}</span>
                </button>
              </div>
            </div>
          ) : filteredSentInquiries.length === 0 ? (
            /* No results matching filter */
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3">
              <p className="text-sm font-bold text-stone-800">No inquiries matching filter "{sentStatusFilter}"</p>
              <button
                onClick={() => setSentStatusFilter('all')}
                className="px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold"
              >
                Show All Inquiries
              </button>
            </div>
          ) : (
            /* Inquiries List */
            <div className="space-y-4">
              {filteredSentInquiries.map((inq) => {
                // Find matching property from allProperties if present
                const matchedProp = allProperties.find((p) => p.id === inq.propertyId);
                const displayTitle = inq.propertyTitle || matchedProp?.title || 'Property Listing';
                const displayCity = inq.propertyCity || matchedProp?.city || '';
                const displayLocality = inq.propertyLocality || matchedProp?.locality || '';
                const displayPrice = inq.propertyPrice || matchedProp?.price;
                const displayType = inq.propertyListingType || matchedProp?.listingType || 'rent';
                const displayImg =
                  inq.propertyImageUrl ||
                  matchedProp?.imageUrls?.[0] ||
                  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80';
                const ownerPhone = inq.ownerPhone || matchedProp?.ownerPhone;

                const status = inq.status || 'sent';

                return (
                  <div
                    key={inq.id}
                    className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 space-y-5">
                      {/* Top Bar: Property Card Header & Status */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Property Snapshot */}
                        <div className="flex items-start gap-4">
                          <div
                            onClick={() => {
                              if (matchedProp) onSelectProperty(matchedProp);
                            }}
                            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 relative ${
                              matchedProp ? 'cursor-pointer hover:opacity-90' : ''
                            }`}
                          >
                            <img
                              src={displayImg}
                              alt={displayTitle}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-900/80 text-white">
                              {displayType}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                              <span>
                                {displayLocality ? `${displayLocality}, ` : ''}
                                {displayCity || 'India'}
                              </span>
                            </div>

                            <h3
                              onClick={() => {
                                if (matchedProp) onSelectProperty(matchedProp);
                              }}
                              className={`font-extrabold text-stone-900 text-base line-clamp-1 ${
                                matchedProp ? 'hover:text-emerald-900 cursor-pointer' : ''
                              }`}
                            >
                              {displayTitle}
                            </h3>

                            {displayPrice != null && (
                              <p className="text-sm font-bold text-emerald-900">
                                {formatPrice(displayPrice, displayType)}
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>
                                Inquired on{' '}
                                {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}{' '}
                                at{' '}
                                {new Date(inq.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge & Actions */}
                        <div className="flex flex-col md:items-end gap-2 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-stone-400">Inquiry Status:</span>
                            {renderStatusBadge(status)}
                          </div>
                          <p className="text-[11px] text-stone-500 max-w-xs text-left md:text-right">
                            {getStatusDescription(status)}
                          </p>
                        </div>
                      </div>

                      {/* Visual 3-Stage Progress Timeline */}
                      <div className="bg-stone-50/80 rounded-2xl p-3.5 border border-stone-100">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          {/* Step 1: Sent */}
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] bg-blue-600 text-white mb-1 shadow-xs">
                              ✓
                            </div>
                            <span className="font-bold text-stone-800 text-[11px]">1. Sent</span>
                            <span className="text-[10px] text-stone-400">Delivered</span>
                          </div>

                          {/* Step 2: Viewed */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 ${
                                status === 'viewed' || status === 'replied' || status === 'closed'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {status === 'viewed' || status === 'replied' || status === 'closed' ? '✓' : '2'}
                            </div>
                            <span
                              className={`font-bold text-[11px] ${
                                status === 'viewed' || status === 'replied' || status === 'closed'
                                  ? 'text-stone-800'
                                  : 'text-stone-400'
                              }`}
                            >
                              2. Viewed
                            </span>
                            <span className="text-[10px] text-stone-400">Read by owner</span>
                          </div>

                          {/* Step 3: Replied */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 ${
                                status === 'replied' || status === 'closed'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {status === 'replied' || status === 'closed' ? '✓' : '3'}
                            </div>
                            <span
                              className={`font-bold text-[11px] ${
                                status === 'replied' || status === 'closed'
                                  ? 'text-emerald-900 font-extrabold'
                                  : 'text-stone-400'
                              }`}
                            >
                              3. Replied
                            </span>
                            <span className="text-[10px] text-stone-400">Direct response</span>
                          </div>
                        </div>
                      </div>

                      {/* Your Message Section */}
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                          <span>Your Message Sent to Owner:</span>
                          <span className="text-stone-400 font-normal normal-case">
                            Contact submitted: {inq.senderPhone} • {inq.senderEmail}
                          </span>
                        </div>
                        <p className="text-stone-700 italic leading-relaxed whitespace-pre-line">
                          "{inq.message}"
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                        <div className="flex items-center gap-2">
                          {matchedProp && (
                            <button
                              onClick={() => onSelectProperty(matchedProp)}
                              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>View Property</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {ownerPhone && (
                            <>
                              <a
                                href={`tel:${ownerPhone}`}
                                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call Owner</span>
                              </a>
                              <a
                                href={`https://wa.me/${
                                  ownerPhone.replace(/[^0-9]/g, '').length === 10
                                    ? '91' + ownerPhone.replace(/[^0-9]/g, '')
                                    : ownerPhone.replace(/[^0-9]/g, '')
                                }?text=${encodeURIComponent(
                                  `Hi, I recently inquired about "${displayTitle}" on Staywise.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}
                        </div>

                        {/* Status Toggle / Close inquiry */}
                        <div className="flex items-center gap-2">
                          {status !== 'closed' ? (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'closed', false)}
                              className="text-stone-500 hover:text-stone-800 text-xs font-semibold underline cursor-pointer"
                            >
                              Mark as Done / Closed
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'sent', false)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Re-open Inquiry</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'listings' ? (
        /* Listings Tab */
        properties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-14 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
              <Building className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No properties published yet</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              You haven't posted any rental or sale listings yet. Publish your property for free to reach thousands of prospective tenants and buyers across India.
            </p>
            <button
              onClick={onOpenPostProperty}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-md cursor-pointer"
            >
              Post Your First Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const propInquiriesCount = inquiries.filter((inq) => inq.propertyId === property.id).length;
              return (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Price banner */}
                    <div className="relative aspect-16/10 bg-stone-100">
                      <img
                        src={
                          property.imageUrls && property.imageUrls.length > 0
                            ? property.imageUrls[0]
                            : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900/80 backdrop-blur-md rounded-lg text-white text-xs font-bold capitalize">
                        For {property.listingType}
                      </div>
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-emerald-900/90 backdrop-blur-md rounded-xl text-white text-sm font-bold">
                        {formatPrice(property.price, property.listingType)}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center text-xs font-medium text-stone-500 gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                        <span>{property.locality}, {property.city}</span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center gap-3">
                        <span>{formatBHK(property.bedrooms, property.propertyType)}</span>
                        <span>•</span>
                        <span>{property.bathrooms} Bath</span>
                        {property.areaSqFt && (
                          <>
                            <span>•</span>
                            <span>{property.areaSqFt} sq.ft</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Inquiry badge */}
                  <div className="p-4 pt-3 border-t border-stone-100 bg-stone-50/50 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {propInquiriesCount} {propInquiriesCount === 1 ? 'Inquiry' : 'Inquiries'}
                      </span>
                      <button
                        onClick={() => onSelectProperty(property)}
                        className="text-stone-600 hover:text-stone-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onEditProperty(property)}
                        className="py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setPropertyToDelete(property)}
                        className="py-2 px-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'saved' ? (
        /* Saved Properties / Wishlist Tab */
        savedProperties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-14 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
              <Heart className="w-8 h-8 fill-rose-500/20" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Your Wishlist is empty</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Browse rental homes, properties for sale, or PG accommodations and click the heart icon on any card to save your favorites here.
            </p>
            <button
              onClick={onExploreProperties}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Properties</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>You have saved <strong className="text-stone-900">{savedProperties.length}</strong> {savedProperties.length === 1 ? 'property' : 'properties'}</span>
              <span className="text-[11px] text-stone-400">Click the red heart on any card to remove it from your wishlist</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={onSelectProperty}
                  isSaved={true}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        /* Received Inquiries Tab (For Property Owners) */
        inquiries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-14 text-center max-w-lg mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No inquiries received yet</h3>
            <p className="text-xs text-stone-500">
              When prospective tenants or buyers send contact messages for your listings, they will show up here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Direct messages from interested tenants and buyers:</span>
              <span className="text-[11px] text-stone-400">You can update each inquiry's status to notify the inquirer</span>
            </div>

            {inquiries.map((inq) => {
              const currentStatus = inq.status || 'sent';

              return (
                <div
                  key={inq.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Inquiry for:
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm">{inq.propertyTitle}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      {renderStatusBadge(currentStatus)}
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-stone-400 font-medium">Interested Person</p>
                      <p className="font-bold text-stone-800 mt-0.5">{inq.senderName}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 font-medium">Phone / WhatsApp</p>
                      <a
                        href={`tel:${inq.senderPhone}`}
                        className="font-bold text-emerald-800 hover:underline mt-0.5 inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {inq.senderPhone}
                      </a>
                    </div>
                    <div>
                      <p className="text-stone-400 font-medium">Email</p>
                      <a
                        href={`mailto:${inq.senderEmail}`}
                        className="font-bold text-stone-800 hover:underline mt-0.5 inline-flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {inq.senderEmail}
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-700 leading-relaxed">
                    <p className="font-medium text-stone-500 text-[10px] uppercase mb-1">Message:</p>
                    "{inq.message}"
                  </div>

                  {/* Owner Status Controls */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-500">Update Status:</span>
                      <button
                        onClick={() => handleUpdateInquiryStatus(inq.id, 'viewed', true)}
                        className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                          currentStatus === 'viewed'
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        Mark Viewed
                      </button>
                      <button
                        onClick={() => handleUpdateInquiryStatus(inq.id, 'replied', true)}
                        className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                          currentStatus === 'replied'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        Mark Replied
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/${
                        inq.senderPhone.replace(/[^0-9]/g, '').length === 10
                          ? '91' + inq.senderPhone.replace(/[^0-9]/g, '')
                          : inq.senderPhone.replace(/[^0-9]/g, '')
                      }?text=${encodeURIComponent(
                        `Hi ${inq.senderName}, thanks for inquiring about "${inq.propertyTitle}" on Staywise.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Reply on WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-stone-900 text-lg">Delete Property Listing?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to remove <span className="font-bold text-stone-800">"{propertyToDelete.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
