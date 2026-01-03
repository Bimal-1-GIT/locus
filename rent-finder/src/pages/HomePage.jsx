import { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Building2, Key, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import SmartMatchSearch from '../components/SmartMatchSearch';
import PropertyCard from '../components/PropertyCard';
import DiscoveryFeed from '../components/DiscoveryFeed';
import { api } from '../services/api';

export default function HomePage() {
  const { colors, isIndigo, isSage, toggleMode } = useMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await api.getProperties({ limit: 8 });
        const transformedProperties = response.properties.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          type: p.listingType === 'RENT' ? 'rent' : 'sale',
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
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Filter properties based on mode
  const filteredProperties = isIndigo 
    ? properties.filter(p => p.type === 'sale')
    : properties.filter(p => p.type === 'rent');
  
  // If no filtered results, show all
  const displayProperties = filteredProperties.length > 0 ? filteredProperties : properties;

  const featuredProperty = displayProperties[0];
  const otherProperties = displayProperties.slice(1);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // In a real app, this would trigger a search
    console.log('Searching for:', query);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative py-16 px-4 overflow-hidden mode-transition ${
        isIndigo ? 'bg-gradient-to-br from-indigo-50 via-white to-slate-50' : 'bg-gradient-to-br from-sage-50 via-white to-slate-50'
      }`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-30 ${
            isIndigo ? 'bg-indigo-300' : 'bg-sage-300'
          }`} />
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
            isIndigo ? 'bg-indigo-200' : 'bg-sage-200'
          }`} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Mode indicator */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              {isIndigo ? (
                <>
                  <Building2 size={18} className="text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Buyer & Seller Mode</span>
                </>
              ) : (
                <>
                  <Key size={18} className="text-sage-500" />
                  <span className="text-sm font-medium text-sage-700">Renter & Landlord Mode</span>
                </>
              )}
              <button 
                onClick={toggleMode}
                className="ml-2 text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Switch
              </button>
            </div>
          </div>

          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-800 mb-4">
              {isIndigo ? 'Find Your Dream Home' : 'Discover Your Perfect Rental'}
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              {isIndigo 
                ? 'Browse exclusive properties with our AI-powered search. From luxury penthouses to charming townhouses.'
                : 'Explore curated rentals tailored to your lifestyle. Quick applications, verified listings.'
              }
            </p>

            {/* SmartMatch Search */}
            <SmartMatchSearch onSearch={handleSearch} className="max-w-2xl mx-auto" />

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className={`text-2xl font-bold ${colors.primaryText}`}>2,500+</p>
                <p className="text-sm text-slate-500">Active Listings</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className={`text-2xl font-bold ${colors.primaryText}`}>98%</p>
                <p className="text-sm text-slate-500">Satisfaction Rate</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className={`text-2xl font-bold ${colors.primaryText}`}>24h</p>
                <p className="text-sm text-slate-500">Avg. Response</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Section - Bento Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-luxury text-2xl font-semibold text-slate-800">Featured Properties</h2>
              <p className="text-slate-500">Handpicked selections for you</p>
            </div>
            <Link 
              to="/search" 
              className={`flex items-center gap-2 ${colors.primaryText} ${colors.primaryTextHover} font-medium`}
            >
              View all <ArrowRight size={18} />
            </Link>
          </div>

          {/* Bento Grid Layout */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : displayProperties.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500">No properties available yet. Be the first to list!</p>
              <Link 
                to="/list-property"
                className={`inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-lg ${colors.primaryBg} text-white font-medium`}
              >
                List a Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Featured large card */}
              {featuredProperty && (
                <div className="md:col-span-2 md:row-span-2">
                  <PropertyCard property={featuredProperty} variant="featured" />
                </div>
              )}
              
              {/* Smaller cards */}
              {otherProperties.slice(0, 4).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>

        {/* Discovery Feed */}
        <DiscoveryFeed properties={displayProperties} />

        {/* Trending Section */}
        <section className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center`}>
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-luxury text-xl font-semibold text-slate-800">Trending Now</h2>
              <p className="text-sm text-slate-500">Most viewed in the last 24 hours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayProperties.slice(0, 4).map((property, idx) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <span className={`w-8 h-8 rounded-full ${colors.primaryBgLight} ${colors.primaryText} flex items-center justify-center font-semibold text-sm`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 truncate group-hover:text-slate-600">
                    {property.title}
                  </h4>
                  <p className="text-sm text-slate-500">{property.city}</p>
                </div>
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={`mt-12 rounded-2xl p-8 md:p-12 ${colors.gradient} text-white overflow-hidden relative`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-luxury text-2xl md:text-3xl font-semibold mb-2">
                {isIndigo ? 'Ready to Make an Offer?' : 'Found Your Next Home?'}
              </h2>
              <p className="text-white/80">
                {isIndigo 
                  ? 'Our Smart Escrow system ensures secure, transparent transactions.'
                  : 'Apply instantly with our one-click application system.'
                }
              </p>
            </div>
            <Link
              to="/search"
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-xl font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
