import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import AuraScore from './AuraScore';

export default function PropertyCard({ property, variant = 'default' }) {
  const [isLiked, setIsLiked] = useState(false);
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
      return `$${price.toLocaleString()}/mo`;
    }
    // For sale properties, format as millions if >= 1M, otherwise show full price
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    return `$${price.toLocaleString()}`;
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

  // Bento grid large card
  if (variant === 'featured') {
    return (
      <Link 
        to={`/property/${property.id}`}
        className="group block relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bento-item col-span-2 row-span-2"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={18} />
              </button>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <span 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentImage ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              property.type === 'sale' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-sage-400 text-white'
            }`}>
              {property.type === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
          </div>

          {/* Like button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isLiked 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/90 text-slate-600 hover:text-rose-500'
            }`}
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
            <h3 className="font-luxury text-xl font-semibold text-slate-800 group-hover:text-slate-600 transition-colors">
              {property.title}
            </h3>
            <span className={`text-xl font-bold ${colors.primaryText}`}>
              {formatPrice(property.price, property.priceType)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 mb-4">
            <MapPin size={14} />
            <span className="text-sm">{property.address}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-slate-600">
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
                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 4 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md">
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
      className="group block relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bento-item"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
          property.type === 'sale' 
            ? 'bg-indigo-600 text-white' 
            : 'bg-sage-400 text-white'
        }`}>
          {property.type === 'sale' ? 'For Sale' : 'For Rent'}
        </span>

        {/* Like button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isLiked 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/90 text-slate-600 hover:text-rose-500'
          }`}
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
          <h3 className="font-medium text-slate-800 line-clamp-1">
            {property.title}
          </h3>
        </div>
        
        <span className={`text-lg font-bold ${colors.primaryText}`}>
          {formatPrice(property.price, property.priceType)}
        </span>

        <div className="flex items-center gap-1 text-slate-400 mt-1 mb-3">
          <MapPin size={12} />
          <span className="text-xs line-clamp-1">{property.city}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bd`}</span>
          <span>•</span>
          <span>{property.bathrooms} ba</span>
          <span>•</span>
          <span>{property.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
}
