import { useState, useEffect } from 'react';
import { Heart, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { api } from '../services/api';

export default function SavedPage() {
  const { colors } = useMode();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/saved' } } });
      return;
    }
    fetchSavedProperties();
  }, [isAuthenticated, navigate]);

  const fetchSavedProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getSavedProperties();
      // Transform saved properties to match expected format
      const properties = response.saved?.map(item => {
        const p = item.property;
        return {
          id: p.id,
          title: p.title,
          type: p.listingType === 'RENT' ? 'rent' : 'sale',
          price: p.price,
          priceType: p.priceType,
          address: `${p.address}, ${p.city}`,
          city: p.city,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqft: p.sqft,
          images: p.images?.map(img => img.url) || ['https://picsum.photos/seed/default/800/600'],
          image: p.images?.[0]?.url || 'https://picsum.photos/seed/default/800/600',
          features: p.features?.map(f => f.name) || [],
          auraScore: p.auraScoreOverall || Math.floor(Math.random() * 20) + 80,
          isSaved: true,
        };
      }) || [];
      setSavedProperties(properties);
    } catch (err) {
      console.error('Failed to fetch saved properties:', err);
      setError('Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = async (id) => {
    try {
      await api.unsaveProperty(id);
      setSavedProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to remove from saved:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading saved properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-luxury text-3xl font-semibold text-slate-800 mb-2">
            Saved Properties
          </h1>
          <p className="text-slate-500">
            {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {savedProperties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-rose-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No saved properties yet</h3>
            <p className="text-slate-500 mb-6">
              Start exploring and save properties you love
            </p>
            <Link
              to="/search"
              className={`inline-flex items-center gap-2 px-6 py-3 ${colors.primaryBg} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity`}
            >
              Browse Properties
              <ExternalLink size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedProperties.map((property) => (
              <div key={property.id} className="relative group">
                <button
                  onClick={() => removeFromSaved(property.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                >
                  <Trash2 size={16} className="text-rose-500" />
                </button>
                <PropertyCard 
                  property={property} 
                  initialSaved={true}
                  onSaveChange={(id, saved) => !saved && removeFromSaved(id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
