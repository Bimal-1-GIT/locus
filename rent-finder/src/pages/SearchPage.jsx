import { useState, useEffect } from 'react';
import { Scale, Loader2 } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import SmartMatchSearch from '../components/SmartMatchSearch';
import PropertyCard from '../components/PropertyCard';
import FilterBar from '../components/FilterBar';
import PropertyComparison from '../components/PropertyComparison';
import { api } from '../services/api';

export default function SearchPage() {
  const { isIndigo, colors } = useMode();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Fetch properties from API
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getProperties();
      // Transform API response to match our component expectations
      const transformedProperties = response.properties.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: p.listingType === 'RENT' ? 'rent' : 'sale', // Use listingType for filtering
        propertyType: p.type, // Keep property type (APARTMENT, HOUSE, etc.)
        listingType: p.listingType,
        price: p.price,
        address: `${p.address}, ${p.city}, ${p.state} ${p.zipCode}`,
        city: p.city,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        sqft: p.sqft,
        image: p.images?.[0]?.url || 'https://picsum.photos/seed/default/800/600',
        images: p.images?.map(img => img.url) || [],
        features: p.features?.map(f => f.name) || [],
        auraScore: p.auraScoreOverall || Math.floor(Math.random() * 20) + 80,
        petFriendly: p.petFriendly,
        availableFrom: p.availableFrom,
        createdAt: p.createdAt
      }));
      setProperties(transformedProperties);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Filter properties locally after fetching
  const filteredProperties = properties.filter(p => {
    // Filter by type
    if (filters.type && p.type !== filters.type) return false;

    // Filter by price range
    if (filters.priceRange) {
      if (p.price < filters.priceRange.min || p.price > filters.priceRange.max) return false;
    }

    // Filter by bedrooms
    if (filters.bedrooms) {
      if (filters.bedrooms === 'Studio' && p.bedrooms !== 0) return false;
      if (filters.bedrooms === '4+' && p.bedrooms < 4) return false;
      if (!isNaN(parseInt(filters.bedrooms)) && p.bedrooms !== parseInt(filters.bedrooms)) return false;
    }

    // Filter by features
    if (filters.features?.length > 0) {
      const hasAllFeatures = filters.features.every(f =>
        p.features?.some(pf => pf.toLowerCase().includes(f.toLowerCase()))
      );
      if (!hasAllFeatures) return false;
    }

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.address?.toLowerCase().includes(query) ||
        p.features?.some(f => f.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    return true;
  });

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
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Scale size={32} className="text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Error loading properties</h3>
            <p className="text-slate-500 mb-4">{error}</p>
            <button 
              onClick={fetchProperties}
              className={`px-4 py-2 rounded-lg ${colors.primaryBg} text-white`}
            >
              Try Again
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
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
