import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Mic } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { searchSuggestions } from '../data/properties';

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
          className={`relative flex items-center bg-white rounded-2xl shadow-lg transition-all duration-300 ${
            isFocused
              ? `ring-2 ${colors.primaryRing} shadow-xl`
              : 'hover:shadow-xl'
          }`}
        >
          {/* AI Badge */}
          <div className={`absolute left-4 flex items-center gap-1.5 ${colors.primaryText}`}>
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
            className="w-full py-4 pl-32 sm:pl-40 pr-24 text-slate-800 placeholder-slate-400 bg-transparent outline-none text-lg"
          />

          {/* Right actions */}
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="button"
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              title="Voice search"
            >
              <Mic size={18} />
            </button>
            <button
              type="submit"
              className={`p-3 rounded-xl ${colors.primaryBg} ${colors.primaryBgHover} text-white transition-colors`}
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query || filteredSuggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
              {query ? 'Suggestions' : 'Try searching for...'}
            </p>
            {(query ? filteredSuggestions : searchSuggestions).slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-3"
              >
                <Search size={16} className="text-slate-400" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
