import { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { Plus, User, LogOut, Home, Key, Building2, Layers, Menu, X, ChevronDown, CheckCircle, Heart, Send } from 'lucide-react';
import type { User as FirebaseUser } from '../lib/firebase';
import type { ListingType } from '../types';

interface NavbarProps {
  currentUser: FirebaseUser | null;
  currentTab: 'home' | ListingType | 'my-properties';
  onNavigate: (tab: 'home' | ListingType | 'my-properties', subTab?: 'listings' | 'saved' | 'my-inquiries' | 'inquiries') => void;
  onOpenAuth: () => void;
  onOpenPostProperty: () => void;
  onSignOut: () => void;
  userPropertiesCount?: number;
  savedPropertiesCount?: number;
}

export function Navbar({
  currentUser,
  currentTab,
  onNavigate,
  onOpenAuth,
  onOpenPostProperty,
  onSignOut,
  userPropertiesCount = 0,
  savedPropertiesCount = 0,
}: NavbarProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer transition-opacity hover:opacity-90"
          >
            <Logo size="md" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'text-emerald-900 bg-emerald-50/90 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('rent')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'rent'
                  ? 'text-emerald-900 bg-emerald-50/90 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              Rent
            </button>
            <button
              onClick={() => onNavigate('sale')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'sale'
                  ? 'text-emerald-900 bg-emerald-50/90 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => onNavigate('pg')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'pg'
                  ? 'text-emerald-900 bg-emerald-50/90 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              PG
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Post Property CTA */}
            <button
              onClick={onOpenPostProperty}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-800 text-white hover:bg-emerald-900 transition-all shadow-xs hover:shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Post Property</span>
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-700/80 text-[10px] uppercase tracking-wider rounded font-semibold text-emerald-100">
                Free
              </span>
            </button>

            {/* Auth section */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all text-sm font-medium text-stone-800"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-600"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold text-xs">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate text-stone-800 text-xs font-semibold">
                    {currentUser.displayName?.split(' ')[0] || 'My Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {currentUser.displayName || 'Property Owner'}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('my-properties', 'my-inquiries');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-emerald-800" />
                          Properties Inquired
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('my-properties', 'listings');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-800" />
                          My Published Listings
                        </span>
                        {userPropertiesCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-full">
                            {userPropertiesCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('my-properties', 'saved');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                          Saved Wishlist
                        </span>
                        {savedPropertiesCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 rounded-full">
                            {savedPropertiesCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('my-properties', 'inquiries');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-800" />
                          Received Inquiries
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenPostProperty();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-emerald-800" />
                        Post New Property
                      </button>
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-400 transition-all"
              >
                <User className="w-4 h-4 text-stone-500" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenPostProperty}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-800 text-white"
            >
              Post Free
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#faf9f6] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'home' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('rent');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'rent' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => {
              onNavigate('sale');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'sale' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => {
              onNavigate('pg');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'pg' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
            }`}
          >
            PG Accommodation
          </button>

          <div className="pt-2 border-t border-stone-200">
            {currentUser ? (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onNavigate('my-properties', 'my-inquiries');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-emerald-900 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Properties Inquired About</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('my-properties', 'listings');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-700 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-800" />
                    My Published Listings
                  </span>
                  {userPropertiesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-emerald-100 rounded-full">
                      {userPropertiesCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onNavigate('my-properties', 'saved');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    Saved Wishlist
                  </span>
                  {savedPropertiesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-rose-50 text-rose-700 rounded-full">
                      {savedPropertiesCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onNavigate('my-properties', 'inquiries');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-700 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Received Inquiries</span>
                </button>
                <button
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600"
                >
                  Sign Out ({currentUser.displayName || currentUser.email})
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-stone-900 text-white text-center"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
