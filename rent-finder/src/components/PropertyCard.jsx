import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Bed, 
  Bath, 
  Square, 
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AuraScore from './AuraScore';

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

export default function PropertyCard({ property, variant = 'default', initialSaved = false, onSaveChange }) {
  const [isLiked, setIsLiked] = useState(initialSaved || property.isSaved || false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLiked(initialSaved || property.isSaved || false);
  }, [initialSaved, property.isSaved]);
  const [currentImage, setCurrentImage] = useState(0);
  const { colors, isIndigo } = useMode();

  // Ensure images array has at least one fallback image
  const images = property.images?.length > 0 
    ? property.images 
    : [property.image || `https://picsum.photos/seed/${property.id || 'default'}/800/600`];

  const formatPrice = (price, priceType) => {
    // Handle rental properties - check for various formats from API
    const isRental = priceType === 'month' || 
                     priceType === 'MONTHLY' || 
                     priceType === 'monthly' ||
                     property.type === 'rent' ||
                     property.type === 'RENT';
    
    if (isRental) {
      return `NPR ${price.toLocaleString()}/mo`;
    }
    // For sale properties, format as Crore/Lakh for Nepali currency
    if (price >= 10000000) {
      return `NPR ${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `NPR ${(price / 100000).toFixed(2)} Lakh`;
    }
    return `NPR ${price.toLocaleString()}`;
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/property/${property.id}` } } });
      return;
    }
    
    try {
      if (isLiked) {
        await api.unsaveProperty(property.id);
      } else {
        await api.saveProperty(property.id);
      }
      setIsLiked(!isLiked);
      if (onSaveChange) {
        onSaveChange(property.id, !isLiked);
      }
    } catch (err) {
      console.error('Failed to save property:', err);
    }
  };

  // Bento grid large card
  if (variant === 'featured') {
    return (
      <Link 
        to={`/property/${property.id}`}
        className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bento-item col-span-2 row-span-2"
        style={{ backgroundColor: '#FFFAF0', border: `2px solid ${NEPALI.gold}` }}
      >
        {/* Image */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={images[currentImage]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(255, 250, 240, 0.95)', color: NEPALI.primary }}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(255, 250, 240, 0.95)', color: NEPALI.primary }}
              >
                <ChevronRight size={18} />
              </button>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <span 
                    key={idx}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{ backgroundColor: idx === currentImage ? NEPALI.gold : 'rgba(255,255,255,0.5)' }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: property.type === 'sale' ? NEPALI.primary : NEPALI.brown }}>
              {property.type === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
          </div>

          {/* Like button */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ 
              backgroundColor: isLiked ? NEPALI.primary : 'rgba(255, 250, 240, 0.95)',
              color: isLiked ? 'white' : NEPALI.textMuted
            }}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          {/* Aura Score */}
          <div className="absolute bottom-3 right-3">
            <AuraScore score={property.auraScore} compact />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-luxury text-xl font-semibold transition-colors" style={{ color: NEPALI.text }}>
              {property.title}
            </h3>
            <span className="text-xl font-bold" style={{ color: NEPALI.primary }}>
              {formatPrice(property.price, property.priceType)}
            </span>
          </div>

          <div className="flex items-center gap-1 mb-4" style={{ color: NEPALI.textMuted }}>
            <MapPin size={14} />
            <span className="text-sm">{property.address}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4" style={{ color: NEPALI.textMuted }}>
            <div className="flex items-center gap-1.5">
              <Bed size={16} />
              <span className="text-sm">{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Beds`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath size={16} />
              <span className="text-sm">{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square size={16} />
              <span className="text-sm">{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mt-4">
            {property.features.slice(0, 4).map((feature, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 text-xs rounded-md"
                style={{ backgroundColor: NEPALI.creamDark, color: NEPALI.textMuted }}
              >
                {feature}
              </span>
            ))}
            {property.features.length > 4 && (
              <span className="px-2 py-1 text-xs rounded-md" style={{ backgroundColor: NEPALI.creamDark, color: NEPALI.textMuted }}>
                +{property.features.length - 4} more
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link 
      to={`/property/${property.id}`}
      className="group block relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bento-item"
      style={{ backgroundColor: '#FFFAF0', border: `2px solid ${NEPALI.gold}` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: property.type === 'sale' ? NEPALI.primary : NEPALI.brown }}>
          {property.type === 'sale' ? 'For Sale' : 'For Rent'}
        </span>

        {/* Like button */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ 
            backgroundColor: isLiked ? NEPALI.primary : 'rgba(255, 250, 240, 0.95)',
            color: isLiked ? 'white' : NEPALI.textMuted
          }}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        {/* Aura Score */}
        <div className="absolute bottom-2 right-2">
          <AuraScore score={property.auraScore} compact />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-medium line-clamp-1" style={{ color: NEPALI.text }}>
            {property.title}
          </h3>
        </div>
        
        <span className="text-lg font-bold" style={{ color: NEPALI.primary }}>
          {formatPrice(property.price, property.priceType)}
        </span>

        <div className="flex items-center gap-1 mt-1 mb-3" style={{ color: NEPALI.textMuted }}>
          <MapPin size={12} />
          <span className="text-xs line-clamp-1">{property.city}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm" style={{ color: NEPALI.textMuted }}>
          <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bd`}</span>
          <span style={{ color: NEPALI.gold }}>•</span>
          <span>{property.bathrooms} ba</span>
          <span style={{ color: NEPALI.gold }}>•</span>
          <span>{property.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
}
