import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Heart, 
  MessageSquare, 
  User, 
  Menu, 
  X,
  Building2,
  Key,
  LogIn,
  Plus,
  LayoutList
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';

// Nepali Theme Colors
const NEPALI = {
  primary: '#8B0000',
  primaryDark: '#5C0000',
  gold: '#D4AF37',
  saffron: '#FF9933',
  cream: '#FDF5E6',
  brown: '#CD853F',
  text: '#2F1810',
  textMuted: '#6B4423',
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { mode, toggleMode, isIndigo, colors } = useMode();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Discover', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/saved', label: 'Saved', icon: Heart },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  // Add My Listings for authenticated users
  const authNavLinks = isAuthenticated 
    ? [...navLinks, { path: '/my-listings', label: 'My Listings', icon: LayoutList }]
    : navLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${NEPALI.primary} 0%, ${NEPALI.primaryDark} 100%)` }}
            >
              <span className="text-white font-bold text-lg">🏔</span>
            </div>
            <div className="flex flex-col">
              <span className="font-luxury text-xl font-semibold" style={{ color: NEPALI.primary }}>
                AuraEstate
              </span>
              <span className="text-xs" style={{ color: NEPALI.textMuted }}>नेपाल</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {authNavLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive(path) ? '#FDF5E6' : 'transparent',
                  color: isActive(path) ? NEPALI.primary : NEPALI.textMuted,
                  border: isActive(path) ? `2px solid ${NEPALI.gold}` : '2px solid transparent',
                  fontWeight: isActive(path) ? '600' : '400'
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* List Property Button */}
            <Link
              to="/list-property"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
              style={{ 
                border: `2px solid ${NEPALI.gold}`,
                color: NEPALI.primary,
                backgroundColor: '#FFFAF0'
              }}
            >
              <Plus size={18} />
              <span>List Property</span>
            </Link>

            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: isIndigo ? '#FDF5E6' : '#F5E6D3',
                color: NEPALI.primary,
                border: `2px solid ${NEPALI.brown}`
              }}
              title={isIndigo ? 'Switch to Renter Mode' : 'Switch to Buyer Mode'}
            >
              {isIndigo ? (
                <>
                  <Building2 size={16} />
                  <span className="hidden sm:inline">Buy/Sell</span>
                </>
              ) : (
                <>
                  <Key size={16} />
                  <span className="hidden sm:inline">Rent</span>
                </>
              )}
            </button>

            {/* Profile / Login */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium"
                style={{ background: `linear-gradient(135deg, ${NEPALI.primary} 0%, ${NEPALI.primaryDark} 100%)` }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:shadow-lg nepali-button-primary"
                style={{ 
                  background: `linear-gradient(135deg, ${NEPALI.primary} 0%, #A52A2A 100%)`,
                  boxShadow: `0 4px 0 ${NEPALI.primaryDark}`
                }}
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: '#FDF5E6',
                color: NEPALI.primary
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden" style={{ borderTop: `2px solid ${NEPALI.gold}`, backgroundColor: '#FFFAF0' }}>
          <nav className="px-4 py-2 space-y-1">
            {authNavLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive(path) ? '#FDF5E6' : 'transparent',
                  color: isActive(path) ? NEPALI.primary : NEPALI.textMuted,
                  border: isActive(path) ? `2px solid ${NEPALI.gold}` : '2px solid transparent',
                  fontWeight: isActive(path) ? '600' : '400'
                }}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
            <Link
              to="/list-property"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{ 
                color: NEPALI.primary,
                backgroundColor: '#FDF5E6',
                border: `2px solid ${NEPALI.gold}`
              }}
            >
              <Plus size={20} />
              <span>List Property</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
