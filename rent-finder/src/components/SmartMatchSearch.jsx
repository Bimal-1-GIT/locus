import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Mic } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { searchSuggestions } from '../data/properties';

// Nepali Theme Colors
const NEPALI = {
  primary: '#8B0000',
  primaryDark: '#5C0000',
  gold: '#D4AF37',
  saffron: '#FF9933',
  cream: '#FDF5E6',
  creamDark: '#F5E6D3',
  brown: '#CD853F',
  text: '#2F1810',
  textMuted: '#6B4423',
};

export default function SmartMatchSearch({ onSearch, className = '' }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const { colors, isIndigo } = useMode();

  const filteredSuggestions = searchSuggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch?.(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <form onSubmit={handleSubmit}>
        <div
          className="relative flex items-center rounded-2xl shadow-lg transition-all duration-300"
          style={{
            backgroundColor: '#FFFAF0',
            border: `2px solid ${isFocused ? NEPALI.primary : NEPALI.gold}`,
            boxShadow: isFocused ? `0 0 0 3px rgba(139, 0, 0, 0.1)` : '0 4px 20px rgba(139, 0, 0, 0.08)'
          }}
        >
          {/* AI Badge */}
          <div className="absolute left-4 flex items-center gap-1.5" style={{ color: NEPALI.primary }}>
            <Sparkles size={18} className="animate-pulse-soft" />
            <span className="text-xs font-medium hidden sm:inline">SmartMatch</span>
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder="Describe your dream property..."
            className="w-full py-4 pl-32 sm:pl-40 pr-24 bg-transparent outline-none text-lg"
            style={{ color: NEPALI.text }}
          />

          {/* Right actions */}
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 rounded-full transition-colors"
                style={{ color: NEPALI.textMuted }}
              >
                <X size={18} />
              </button>
            )}
            <button
              type="button"
              className="p-2 rounded-full transition-colors"
              style={{ color: NEPALI.textMuted }}
              title="Voice search"
            >
              <Mic size={18} />
            </button>
            <button
              type="submit"
              className="p-3 rounded-xl text-white transition-all hover:shadow-md"
              style={{ 
                background: `linear-gradient(135deg, ${NEPALI.primary} 0%, #A52A2A 100%)`,
              }}
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query || filteredSuggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl overflow-hidden z-50"
          style={{ backgroundColor: '#FFFAF0', border: `2px solid ${NEPALI.gold}` }}>
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide" style={{ color: NEPALI.textMuted }}>
              {query ? 'Suggestions' : 'Try searching for...'}
            </p>
            {(query ? filteredSuggestions : searchSuggestions).slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3"
                style={{ color: NEPALI.text }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = NEPALI.creamDark}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Search size={16} style={{ color: NEPALI.brown }} />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
