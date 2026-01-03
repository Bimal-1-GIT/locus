import { useState } from 'react';
import { Filter, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { featureTags } from '../data/properties';

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

export default function FilterBar({ 
  filters, 
  onFilterChange, 
  viewMode, 
  onViewModeChange,
  resultCount 
}) {
  const [showFilters, setShowFilters] = useState(false);
  const { colors, isIndigo } = useMode();

  const priceRanges = isIndigo 
    ? [
        { label: 'Under NPR 1Cr', min: 0, max: 10000000 },
        { label: 'NPR 1Cr - 2Cr', min: 10000000, max: 20000000 },
        { label: 'NPR 2Cr - 5Cr', min: 20000000, max: 50000000 },
        { label: 'NPR 5Cr+', min: 50000000, max: Infinity },
      ]
    : [
        { label: 'Under NPR 20,000', min: 0, max: 20000 },
        { label: 'NPR 20,000 - 35,000', min: 20000, max: 35000 },
        { label: 'NPR 35,000 - 50,000', min: 35000, max: 50000 },
        { label: 'NPR 50,000+', min: 50000, max: Infinity },
      ];

  const bedroomOptions = ['Studio', '1', '2', '3', '4+'];

  const toggleFeature = (feature) => {
    const current = filters.features || [];
    const updated = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature];
    onFilterChange({ ...filters, features: updated });
  };

  const clearFilters = () => {
    onFilterChange({
      priceRange: null,
      bedrooms: null,
      features: [],
      type: null
    });
  };

  const activeFilterCount = [
    filters.priceRange,
    filters.bedrooms,
    filters.type,
    ...(filters.features || [])
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex items-center justify-between rounded-xl p-3 shadow-md"
        style={{ backgroundColor: '#FFFAF0', border: `2px solid ${NEPALI.gold}` }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: showFilters || activeFilterCount > 0 ? NEPALI.creamDark : 'transparent',
              color: showFilters || activeFilterCount > 0 ? NEPALI.primary : NEPALI.textMuted,
              border: showFilters || activeFilterCount > 0 ? `2px solid ${NEPALI.gold}` : '2px solid transparent'
            }}
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                style={{ backgroundColor: NEPALI.primary }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick filters */}
          <div className="hidden md:flex items-center gap-2 pl-3" style={{ borderLeft: `2px solid ${NEPALI.gold}` }}>
            <button
              onClick={() => onFilterChange({ ...filters, type: filters.type === 'rent' ? null : 'rent' })}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: filters.type === 'rent' ? NEPALI.brown : 'transparent',
                color: filters.type === 'rent' ? 'white' : NEPALI.textMuted,
                border: `2px solid ${filters.type === 'rent' ? NEPALI.brown : NEPALI.creamDark}`
              }}
            >
              For Rent
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, type: filters.type === 'sale' ? null : 'sale' })}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: filters.type === 'sale' ? NEPALI.primary : 'transparent',
                color: filters.type === 'sale' ? 'white' : NEPALI.textMuted,
                border: `2px solid ${filters.type === 'sale' ? NEPALI.primary : NEPALI.creamDark}`
              }}
            >
              For Sale
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: NEPALI.textMuted }}>
            {resultCount} {resultCount === 1 ? 'property' : 'properties'}
          </span>

          {/* View mode toggle */}
          <div className="flex items-center rounded-lg p-1" style={{ backgroundColor: NEPALI.creamDark }}>
            <button
              onClick={() => onViewModeChange('grid')}
              className="p-2 rounded-md transition-colors"
              style={{
                backgroundColor: viewMode === 'grid' ? '#FFFAF0' : 'transparent',
                color: viewMode === 'grid' ? NEPALI.primary : NEPALI.textMuted,
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className="p-2 rounded-md transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? '#FFFAF0' : 'transparent',
                color: viewMode === 'list' ? NEPALI.primary : NEPALI.textMuted,
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="rounded-xl p-6 shadow-md space-y-6"
          style={{ backgroundColor: '#FFFAF0', border: `2px solid ${NEPALI.gold}` }}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium" style={{ color: NEPALI.primary }}>Filter Properties</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm flex items-center gap-1 hover:underline"
                style={{ color: NEPALI.textMuted }}
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: NEPALI.text }}>Price Range</label>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => onFilterChange({ 
                    ...filters, 
                    priceRange: filters.priceRange?.label === range.label ? null : range 
                  })}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: filters.priceRange?.label === range.label ? NEPALI.primary : NEPALI.creamDark,
                    color: filters.priceRange?.label === range.label ? 'white' : NEPALI.textMuted,
                    border: `2px solid ${filters.priceRange?.label === range.label ? NEPALI.primary : NEPALI.brown}`
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: NEPALI.text }}>Bedrooms</label>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onFilterChange({ 
                    ...filters, 
                    bedrooms: filters.bedrooms === option ? null : option 
                  })}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: filters.bedrooms === option ? NEPALI.primary : NEPALI.creamDark,
                    color: filters.bedrooms === option ? 'white' : NEPALI.textMuted,
                    border: `2px solid ${filters.bedrooms === option ? NEPALI.primary : NEPALI.brown}`
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: NEPALI.text }}>Features</label>
            <div className="flex flex-wrap gap-2">
              {featureTags.map((feature) => (
                <button
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: (filters.features || []).includes(feature) ? NEPALI.primary : NEPALI.creamDark,
                    color: (filters.features || []).includes(feature) ? 'white' : NEPALI.textMuted,
                    border: `2px solid ${(filters.features || []).includes(feature) ? NEPALI.primary : NEPALI.brown}`
                  }}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
