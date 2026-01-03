import { useState, useMemo } from 'react';
import { Scale } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import SmartMatchSearch from '../components/SmartMatchSearch';
import PropertyCard from '../components/PropertyCard';
import FilterBar from '../components/FilterBar';
import PropertyComparison from '../components/PropertyComparison';
import { properties } from '../data/properties';

export default function SearchPage() {
  const { isIndigo, colors } = useMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showComparison, setShowComparison] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: null,
    bedrooms: null,
    features: [],
    type: null
  });

  // Filter properties
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Filter by type based on mode if not explicitly filtered
    if (filters.type) {
      result = result.filter(p => p.type === filters.type);
    }

    // Filter by price range
    if (filters.priceRange) {
      result = result.filter(p => {
        return p.price >= filters.priceRange.min && p.price <= filters.priceRange.max;
      });
    }

    // Filter by bedrooms
    if (filters.bedrooms) {
      result = result.filter(p => {
        if (filters.bedrooms === 'Studio') return p.bedrooms === 0;
        if (filters.bedrooms === '4+') return p.bedrooms >= 4;
        return p.bedrooms === parseInt(filters.bedrooms);
      });
    }

    // Filter by features
    if (filters.features?.length > 0) {
      result = result.filter(p => 
        filters.features.every(f => 
          p.features.some(pf => pf.toLowerCase().includes(f.toLowerCase()))
        )
      );
    }

    // Simple text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        p.features.some(f => f.toLowerCase().includes(query))
      );
    }

    return result;
  }, [filters, searchQuery, isIndigo]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const toggleCompare = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className={`py-8 px-4 ${isIndigo ? 'bg-indigo-50' : 'bg-sage-50'}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-luxury text-3xl font-semibold text-slate-800 text-center mb-6">
            Find Your Perfect Property
          </h1>
          <SmartMatchSearch onSearch={handleSearch} className="max-w-2xl mx-auto" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filteredProperties.length}
        />

        {/* Compare Toggle */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showComparison || compareIds.length > 0
                ? `${colors.primaryBg} text-white`
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Scale size={18} />
            Compare ({compareIds.length}/3)
          </button>

          {compareIds.length > 0 && (
            <button
              onClick={() => setCompareIds([])}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Comparison Panel */}
        {showComparison && (
          <div className="mb-8">
            <PropertyComparison
              properties={properties}
              selectedIds={compareIds}
              onRemove={(id) => setCompareIds(prev => prev.filter(i => i !== id))}
              onAdd={() => {/* Could open a modal to select properties */}}
            />
          </div>
        )}

        {/* Results */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Scale size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No properties found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className={`mt-6 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {filteredProperties.map((property) => (
              <div key={property.id} className="relative">
                {/* Compare checkbox */}
                <button
                  onClick={() => toggleCompare(property.id)}
                  className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    compareIds.includes(property.id)
                      ? `${colors.primaryBg} ${colors.primaryBorder} text-white`
                      : 'bg-white/90 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {compareIds.includes(property.id) && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <PropertyCard property={property} variant={viewMode === 'list' ? 'list' : 'default'} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
