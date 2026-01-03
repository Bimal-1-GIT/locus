import { useState } from 'react';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import PropertyCard from '../components/PropertyCard';
import { properties } from '../data/properties';

export default function SavedPage() {
  const { colors } = useMode();
  // Mock saved properties - in real app, this would come from state/API
  const [savedIds, setSavedIds] = useState([1, 2, 5]);

  const savedProperties = properties.filter(p => savedIds.includes(p.id));

  const removeFromSaved = (id) => {
    setSavedIds(prev => prev.filter(i => i !== id));
  };

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
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
