import { useState } from 'react';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  ShieldCheck,
  Phone,
  Mail,
  Send,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  Share2,
  Heart,
  MessageCircle,
} from 'lucide-react';
import type { Property } from '../types';
import type { User as FirebaseUser } from '../lib/firebase';
import { createInquiry } from '../lib/propertyService';
import { formatPrice, formatBHK, formatFurnishing, formatNumberIN } from '../lib/formatters';

interface PropertyDetailModalProps {
  property: Property;
  currentUser: FirebaseUser | null;
  isSaved?: boolean;
  onToggleSave?: (propertyId: string) => void;
  onClose: () => void;
  onOpenAuth: () => void;
}

export function PropertyDetailModal({
  property,
  currentUser,
  isSaved = false,
  onToggleSave,
  onClose,
  onOpenAuth,
}: PropertyDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Inquiry form states
  const [senderName, setSenderName] = useState(currentUser?.displayName || '');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [senderPhone, setSenderPhone] = useState('');
  const [message, setMessage] = useState(
    `Hi ${property.ownerName || 'Owner'}, I am interested in your ${property.title} in ${property.locality}, ${property.city}. Please let me know when we can schedule a visit.`
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = property.imageUrls && property.imageUrls.length > 0
    ? property.imageUrls
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'];

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validation
    if (!senderName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!senderEmail.trim() || !senderEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!senderPhone.trim() || senderPhone.trim().length < 8) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please write a short message for the property owner.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInquiry({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyOwnerId: property.ownerId,
        senderUserId: currentUser ? currentUser.uid : '',
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone.trim(),
        message: message.trim(),
        status: 'sent',
        propertyCity: property.city,
        propertyLocality: property.locality,
        propertyPrice: property.price,
        propertyListingType: property.listingType,
        propertyImageUrl: property.imageUrls?.[0] || '',
        ownerName: property.ownerName,
        ownerPhone: property.ownerPhone || '',
      });
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('Failed to submit inquiry:', err);
      setErrorMessage('Could not send message to the owner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#faf9f6] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Header bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-900 text-white uppercase tracking-wider">
              {property.listingType === 'rent' ? 'For Rent' : property.listingType === 'sale' ? 'For Sale' : 'PG / Co-living'}
            </span>
            {property.isDemo && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500/90 text-amber-950 rounded-lg">
                <Sparkles className="w-3 h-3" />
                Demo Listing
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(property.id)}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  isSaved
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
                title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors relative"
              title="Copy property link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-700" /> : <Share2 className="w-4 h-4" />}
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-8">
          {/* Gallery Section */}
          <div className="space-y-3">
            {/* Main large image */}
            <div className="relative aspect-16/9 sm:aspect-21/9 w-full rounded-2xl overflow-hidden bg-stone-200 shadow-inner">
              <img
                src={images[activeImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 bg-stone-900/80 backdrop-blur-md rounded-lg text-white text-xs font-medium">
                Photo {activeImageIndex + 1} of {images.length}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-emerald-800 ring-2 ring-emerald-800/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Info & Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 cols: Details & Specifications */}
            <div className="lg:col-span-7 space-y-6">
              {/* Title, Location & Price */}
              <div className="space-y-2">
                <div className="flex items-center text-xs font-semibold text-emerald-800 gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{property.locality}, {property.city}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
                  {property.title}
                </h1>
                {property.publicAddress && (
                  <p className="text-xs text-stone-500 font-normal">
                    {property.publicAddress}
                  </p>
                )}
              </div>

              {/* Price Banner Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                    {property.listingType === 'rent' ? 'Monthly Rent' : property.listingType === 'sale' ? 'Expected Price' : 'Monthly PG Rent'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {formatPrice(property.price, property.listingType)}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-xs text-stone-600">
                  {property.securityDeposit != null && property.securityDeposit > 0 && (
                    <div>
                      <p className="text-stone-400 font-medium">Security Deposit</p>
                      <p className="font-bold text-stone-800">₹{formatNumberIN(property.securityDeposit)}</p>
                    </div>
                  )}

                  {property.maintenanceCharges != null && (
                    <div>
                      <p className="text-stone-400 font-medium">Maintenance</p>
                      <p className="font-bold text-stone-800">
                        {property.maintenanceCharges > 0 ? `₹${formatNumberIN(property.maintenanceCharges)}/mo` : 'Included'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-stone-200/80">
                  <p className="text-[11px] font-medium text-stone-400">Bedrooms</p>
                  <p className="font-bold text-stone-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-emerald-800" />
                    <span>{formatBHK(property.bedrooms, property.propertyType)}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-stone-200/80">
                  <p className="text-[11px] font-medium text-stone-400">Bathrooms</p>
                  <p className="font-bold text-stone-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-emerald-800" />
                    <span>{property.bathrooms} Washrooms</span>
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-stone-200/80">
                  <p className="text-[11px] font-medium text-stone-400">Super Area</p>
                  <p className="font-bold text-stone-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-emerald-800" />
                    <span>{property.areaSqFt ? `${property.areaSqFt} sq.ft` : 'Spacious'}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-stone-200/80">
                  <p className="text-[11px] font-medium text-stone-400">Furnishing</p>
                  <p className="font-bold text-stone-900 text-sm mt-0.5 capitalize">
                    {formatFurnishing(property.furnishing)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 space-y-3">
                <h3 className="font-bold text-stone-900 text-base">Property Description</h3>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>

                {property.availableFrom && (
                  <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-emerald-900">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>Available From: {property.availableFrom}</span>
                  </div>
                )}
              </div>

              {/* Amenities List */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 space-y-3">
                  <h3 className="font-bold text-stone-900 text-base">Amenities & Highlights</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {property.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100 text-xs font-medium text-stone-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 cols: Contact Owner Card & Direct Lead Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* Owner Info Box */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-md space-y-5">
                <div className="flex items-center gap-3.5 pb-4 border-b border-stone-100">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-lg">
                    {property.ownerName ? property.ownerName.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-stone-900 text-base">
                        {property.ownerName || 'Property Owner'}
                      </p>
                      <span title="Direct Owner Listing">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-medium">Individual Property Owner</p>
                  </div>
                </div>

                {/* Direct contact info if owner opted in */}
                {property.showContactDirectly && property.ownerPhone ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Direct Owner Verified Contact</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Zero Brokerage</span>
                    </p>
                    <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                      <Phone className="w-4 h-4 text-emerald-800" />
                      <span>{property.ownerPhone}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${property.ownerPhone}`}
                        className="py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Owner</span>
                      </a>
                      <a
                        href={`https://wa.me/${property.ownerPhone.replace(/[^0-9]/g, '').length === 10 ? '91' + property.ownerPhone.replace(/[^0-9]/g, '') : property.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${property.ownerName || 'Owner'}, I am interested in your property listing "${property.title}" on Staywise.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    🔒 The owner has chosen to receive messages directly through Staywise to protect their privacy. Send an inquiry below!
                  </p>
                )}

                {/* Inquiry Form */}
                <div className="space-y-3">
                  <h4 className="font-bold text-stone-900 text-sm">
                    Send Direct Inquiry to Owner
                  </h4>

                  {submitSuccess ? (
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
                      <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 mx-auto flex items-center justify-center">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <p className="font-bold text-emerald-950 text-sm">Inquiry Sent Successfully!</p>
                      <p className="text-xs text-emerald-800">
                        The property owner has received your contact details and message. They will reach out to you shortly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitSuccess(false)}
                        className="mt-2 text-xs font-semibold text-emerald-900 underline"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitInquiry} className="space-y-3">
                      {errorMessage && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Phone / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            required
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            placeholder="rahul@example.com"
                            className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Message
                        </label>
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-800 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        {isSubmitting ? (
                          <span>Sending Inquiry...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Contact Owner Directly</span>
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-stone-400 text-center">
                        Staywise guarantees 100% privacy. No spam or unsolicited broker calls.
                      </p>

                      {!currentUser && (
                        <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 text-center">
                          💡 <button type="button" onClick={onOpenAuth} className="font-bold underline hover:text-amber-950">Sign in with Google</button> to track this inquiry's status in your User Dashboard.
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
