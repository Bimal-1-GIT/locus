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
            <div className={`w-10 h-10 rounded-xl ${colors.primaryBg} flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-luxury text-xl font-semibold text-slate-800">
              AuraEstate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {authNavLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(path)
                    ? `${colors.primaryBgLight} ${colors.primaryText} font-medium`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
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
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
                isIndigo 
                  ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50' 
                  : 'border-sage-200 text-sage-700 hover:bg-sage-50'
              }`}
            >
              <Plus size={18} />
              <span>List Property</span>
            </Link>

            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all mode-transition ${
                isIndigo 
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
              }`}
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
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${
                  isIndigo ? 'bg-indigo-500' : 'bg-sage-500'
                }`}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Link>
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                  isIndigo ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-sage-600 hover:bg-sage-700'
                }`}
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="px-4 py-2 space-y-1">
            {authNavLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(path)
                    ? `${colors.primaryBgLight} ${colors.primaryText} font-medium`
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
            <Link
              to="/list-property"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isIndigo 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-sage-600 bg-sage-50'
              }`}
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
