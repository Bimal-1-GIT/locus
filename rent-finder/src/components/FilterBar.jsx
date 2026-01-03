import { useState } from 'react';
import { Filter, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { featureTags } from '../data/properties';

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
        { label: 'Under $1M', min: 0, max: 1000000 },
        { label: '$1M - $2M', min: 1000000, max: 2000000 },
        { label: '$2M - $5M', min: 2000000, max: 5000000 },
        { label: '$5M+', min: 5000000, max: Infinity },
      ]
    : [
        { label: 'Under $2,000', min: 0, max: 2000 },
        { label: '$2,000 - $3,000', min: 2000, max: 3000 },
        { label: '$3,000 - $5,000', min: 3000, max: 5000 },
        { label: '$5,000+', min: 5000, max: Infinity },
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
      <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? `${colors.primaryBgLight} ${colors.primaryText}`
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className={`w-5 h-5 rounded-full ${colors.primaryBg} text-white text-xs flex items-center justify-center`}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick filters */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
            <button
              onClick={() => onFilterChange({ ...filters, type: filters.type === 'rent' ? null : 'rent' })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.type === 'rent'
                  ? 'bg-sage-100 text-sage-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              For Rent
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, type: filters.type === 'sale' ? null : 'sale' })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.type === 'sale'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              For Sale
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {resultCount} {resultCount === 1 ? 'property' : 'properties'}
          </span>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-slate-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-800">Filter Properties</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Price Range</label>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => onFilterChange({ 
                    ...filters, 
                    priceRange: filters.priceRange?.label === range.label ? null : range 
                  })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.priceRange?.label === range.label
                      ? `${colors.primaryBg} text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Bedrooms</label>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onFilterChange({ 
                    ...filters, 
                    bedrooms: filters.bedrooms === option ? null : option 
                  })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.bedrooms === option
                      ? `${colors.primaryBg} text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">Features</label>
            <div className="flex flex-wrap gap-2">
              {featureTags.map((feature) => (
                <button
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (filters.features || []).includes(feature)
                      ? `${colors.primaryBg} text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
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
