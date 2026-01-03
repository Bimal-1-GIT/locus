import { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Building2, Key, Sparkles, Loader2, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import SmartMatchSearch from '../components/SmartMatchSearch';
import PropertyCard from '../components/PropertyCard';
import DiscoveryFeed from '../components/DiscoveryFeed';
import { api } from '../services/api';

// Nepali Theme Colors
const NEPALI = {
  primary: '#8B0000',
  primaryDark: '#5C0000',
  gold: '#D4AF37',
  goldLight: '#E5C158',
  saffron: '#FF9933',
  cream: '#FDF5E6',
  creamDark: '#F5E6D3',
  brown: '#CD853F',
  text: '#2F1810',
  textMuted: '#6B4423',
};

export default function HomePage() {
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

  // Show all properties (both rent and sale)
  const displayProperties = properties;

  const featuredProperty = displayProperties[0];
  const otherProperties = displayProperties.slice(1);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // In a real app, this would trigger a search
    console.log('Searching for:', query);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: NEPALI.cream }}>
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden mode-transition" style={{
        background: `linear-gradient(135deg, ${NEPALI.cream} 0%, #FFFAF0 50%, ${NEPALI.creamDark} 100%)`
      }}>
        {/* Background decoration - Nepali inspired patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20" 
            style={{ backgroundColor: NEPALI.gold }} />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-15" 
            style={{ backgroundColor: NEPALI.primary }} />
          {/* Decorative mountain silhouette */}
          <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5"
            style={{
              background: `linear-gradient(135deg, ${NEPALI.primary} 25%, transparent 25%),
                          linear-gradient(225deg, ${NEPALI.primary} 25%, transparent 25%)`,
              backgroundSize: '64px 64px'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl font-semibold mb-4" style={{ color: NEPALI.primary }}>
              Find Your Perfect Property
            </h1>
            <p className="text-sm mb-1" style={{ color: NEPALI.gold }}>
              सपनाको घर खोज्नुहोस्
            </p>
            <p className="text-lg mb-8" style={{ color: NEPALI.textMuted }}>
              Browse properties for rent or sale with our AI-powered search. From cozy apartments to luxury homes.
            </p>

            {/* SmartMatch Search */}
            <SmartMatchSearch onSearch={handleSearch} className="max-w-2xl mx-auto" />

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: NEPALI.primary }}>2,500+</p>
                <p className="text-sm" style={{ color: NEPALI.textMuted }}>Active Listings</p>
              </div>
              <div className="w-px h-10" style={{ backgroundColor: NEPALI.gold }} />
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: NEPALI.primary }}>98%</p>
                <p className="text-sm" style={{ color: NEPALI.textMuted }}>Satisfaction Rate</p>
              </div>
              <div className="w-px h-10" style={{ backgroundColor: NEPALI.gold }} />
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: NEPALI.primary }}>24h</p>
                <p className="text-sm" style={{ color: NEPALI.textMuted }}>Avg. Response</p>
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
              <h2 className="font-luxury text-2xl font-semibold" style={{ color: NEPALI.primary }}>
                <span style={{ color: NEPALI.gold }}>◈</span> Featured Properties
              </h2>
              <p style={{ color: NEPALI.textMuted }}>Handpicked selections for you</p>
            </div>
            <Link 
              to="/search" 
              className="flex items-center gap-2 font-medium transition-colors hover:underline"
              style={{ color: NEPALI.primary }}
            >
              View all <ArrowRight size={18} />
            </Link>
          </div>

          {/* Bento Grid Layout */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: NEPALI.brown }} />
            </div>
          ) : displayProperties.length === 0 ? (
            <div className="text-center py-16">
              <p style={{ color: NEPALI.textMuted }}>No properties available yet. Be the first to list!</p>
              <Link 
                to="/list-property"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${NEPALI.primary} 0%, #A52A2A 100%)`,
                  boxShadow: `0 4px 0 ${NEPALI.primaryDark}`
                }}
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
        <section className="mt-12 rounded-2xl p-8 shadow-lg relative overflow-hidden" 
          style={{ 
            backgroundColor: '#FFFAF0',
            border: `2px solid ${NEPALI.gold}`
          }}>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" 
            style={{ background: `radial-gradient(circle at 100% 0%, ${NEPALI.primary} 0%, transparent 70%)` }} />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: NEPALI.creamDark, border: `2px solid ${NEPALI.gold}` }}>
              <TrendingUp size={20} style={{ color: NEPALI.saffron }} />
            </div>
            <div>
              <h2 className="font-luxury text-xl font-semibold" style={{ color: NEPALI.primary }}>Trending Now</h2>
              <p className="text-sm" style={{ color: NEPALI.textMuted }}>Most viewed in the last 24 hours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayProperties.slice(0, 4).map((property, idx) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className="flex items-center gap-4 p-3 rounded-xl transition-all hover:shadow-md group"
                style={{ 
                  backgroundColor: '#FFFDF9',
                  border: `2px solid ${NEPALI.creamDark}`
                }}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${NEPALI.primary} 0%, #A52A2A 100%)` }}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate group-hover:underline" style={{ color: NEPALI.text }}>
                    {property.title}
                  </h4>
                  <p className="text-sm" style={{ color: NEPALI.textMuted }}>{property.city}</p>
                </div>
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-12 h-12 rounded-lg object-cover"
                  style={{ border: `2px solid ${NEPALI.creamDark}` }}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-12 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative"
          style={{ background: `linear-gradient(135deg, ${NEPALI.primary} 0%, ${NEPALI.primaryDark} 100%)` }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" 
              style={{ backgroundColor: NEPALI.gold }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl"
              style={{ backgroundColor: NEPALI.saffron }} />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-luxury text-2xl md:text-3xl font-semibold mb-2">
                Ready to Find Your Next Home?
              </h2>
              <p className="text-sm mb-1" style={{ color: NEPALI.gold }}>
                तपाईंको नयाँ घर भेट्टाउनुहोस्
              </p>
              <p className="text-white/80">
                Browse rentals or properties for sale. Apply instantly or make an offer with our secure platform.
              </p>
            </div>
            <Link
              to="/search"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg whitespace-nowrap"
              style={{ 
                backgroundColor: NEPALI.gold,
                color: NEPALI.text
              }}
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
