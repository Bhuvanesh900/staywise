import { Logo } from './Logo';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'rent' | 'sale' | 'pg') => void;
  onOpenPostProperty: () => void;
}

export function Footer({ onNavigate, onOpenPostProperty }: FooterProps) {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Staywise is India's dedicated direct real estate discovery network. We eliminate middlemen and high brokerages, empowering property owners and home seekers to connect with transparency and trust.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Direct Owners • Verified Listings</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              Explore Properties
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-medium">
              <li>
                <button
                  onClick={() => onNavigate('rent')}
                  className="hover:text-white transition-colors"
                >
                  Rental Homes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sale')}
                  className="hover:text-white transition-colors"
                >
                  Properties for Sale
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pg')}
                  className="hover:text-white transition-colors"
                >
                  PG & Co-Living Spaces
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPostProperty}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  Post Your Property (Free)
                </button>
              </li>
            </ul>
          </div>

          {/* Major Cities */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              Major Hubs
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-medium">
              <li>
                <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('rent')}>
                  Properties in Pune
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('rent')}>
                  Flats in Mumbai
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('rent')}>
                  Apartments in Bengaluru
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('rent')}>
                  Homes in Hyderabad
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('rent')}>
                  Flats in Delhi NCR & Chennai
                </span>
              </li>
            </ul>
          </div>

          {/* About & Trust */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-xs text-stone-400 font-medium">
              <li>
                <span className="hover:text-white cursor-pointer">About Staywise</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">How It Works</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Zero Brokerage Guarantee</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Staywise Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-stone-400">
            <span>Crafted for Indian renters, buyers, and home owners</span>
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
