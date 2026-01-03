import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Calendar,
  Car,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Phone,
  Shield,
  Zap,
  Loader2,
  Edit,
  User
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import AuraScore from '../components/AuraScore';
import { api } from '../services/api';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors, isIndigo } = useMode();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getProperty(id);
        
        // Transform property data
        const p = response.property;
        const transformedProperty = {
          id: p.id,
          title: p.title,
          description: p.description,
          type: p.listingType === 'RENT' ? 'rent' : 'sale',
          listingType: p.listingType,
          priceType: p.priceType,
          price: p.price,
          deposit: p.deposit,
          address: `${p.address}, ${p.city}, ${p.state} ${p.zipCode}`,
          city: p.city,
          state: p.state,
          zipCode: p.zipCode,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqft: p.sqft,
          images: p.images?.map(img => img.url) || ['https://picsum.photos/seed/default/800/600'],
          features: p.features?.map(f => f.name) || [],
          auraScore: p.auraScoreOverall || Math.floor(Math.random() * 20) + 80,
          petFriendly: p.petFriendly,
          parking: p.parking || 'Not specified',
          available: p.availableFrom ? new Date(p.availableFrom).toLocaleDateString() : 'Now',
          owner: p.owner,
          ownerId: p.ownerId,
          createdAt: p.createdAt,
          viewCount: p.viewCount || 0
        };
        
        setProperty(transformedProperty);
        setIsLiked(p.isSaved || false);
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setError('Property not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const formatPrice = (price, priceType, type) => {
    const isRental = priceType === 'MONTHLY' || priceType === 'monthly' || priceType === 'month' || type === 'rent';
    if (isRental) {
      return `$${price.toLocaleString()}/month`;
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const nextImage = () => {
    if (property?.images?.length > 1) {
      setCurrentImage((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images?.length > 1) {
      setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const handleSaveProperty = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/property/${id}` } } });
      return;
    }
    
    try {
      if (isLiked) {
        await api.unsaveProperty(id);
      } else {
        await api.saveProperty(id);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to save property:', err);
    }
  };

  const isOwner = isAuthenticated && user?.id === property?.ownerId;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Property not found</h2>
          <p className="text-slate-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className={`${colors.primaryBg} text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity`}>
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/search" 
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to search</span>
            </Link>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Link
                  to={`/edit-listing/${property.id}`}
                  className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors flex items-center gap-2"
                >
                  <Edit size={18} />
                  <span className="text-sm font-medium">Edit</span>
                </Link>
              )}
              <button
                onClick={handleSaveProperty}
                className={`p-2 rounded-lg transition-colors ${
                  isLiked 
                    ? 'bg-rose-100 text-rose-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-200">
              <img
                src={property.images[currentImage]}
                alt={property.title}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              
              {/* Navigation */}
              {property.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Thumbnails */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {property.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentImage 
                            ? 'border-white scale-110' 
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Badge */}
              <span className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold ${
                property.type === 'sale' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-sage-400 text-white'
              }`}>
                {property.type === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-luxury text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={18} />
                    <span>{property.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${colors.primaryText}`}>
                    {formatPrice(property.price, property.priceType, property.type)}
                  </p>
                  {property.type === 'rent' && property.deposit && (
                    <p className="text-sm text-slate-500">Deposit: ${property.deposit.toLocaleString()}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 py-4 border-y border-slate-100">
                <div className="flex items-center gap-2">
                  <Bed size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-800">
                    {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bedrooms`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-800">{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-800">{property.sqft?.toLocaleString() || 'N/A'} sqft</span>
                </div>
              </div>

              {/* Description */}
              <div className="py-4">
                <h3 className="font-semibold text-slate-800 mb-2">About this property</h3>
                <p className="text-slate-600 leading-relaxed">{property.description || 'No description available.'}</p>
              </div>

              {/* Features */}
              {property.features.length > 0 && (
                <div className="py-4 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-3">Features & Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className={`px-3 py-1.5 ${colors.primaryBgLight} ${colors.primaryText} rounded-full text-sm font-medium`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="py-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Available</p>
                    <p className="text-sm font-medium text-slate-800">{property.available}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Car size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Parking</p>
                    <p className="text-sm font-medium text-slate-800">{property.parking}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Pets</p>
                    <p className="text-sm font-medium text-slate-800">
                      {property.petFriendly ? 'Allowed' : 'Not allowed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Aura Score and Contact */}
          <div className="space-y-6">
            {/* Aura Score */}
            <AuraScore score={property.auraScore} />

            {/* Owner Info */}
            {property.owner && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Listed by</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    {property.owner.avatar ? (
                      <img src={property.owner.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {property.owner.firstName} {property.owner.lastName}
                    </p>
                    {property.owner.landlordProfile?.isVerified && (
                      <span className="text-xs text-green-600 font-medium">✓ Verified Landlord</span>
                    )}
                  </div>
                </div>
                {property.owner.landlordProfile?.responseRate && (
                  <p className="text-sm text-slate-500">
                    Response rate: {property.owner.landlordProfile.responseRate}%
                  </p>
                )}
              </div>
            )}

            {/* Contact Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Interested in this property?</h3>
              
              {property.type === 'rent' ? (
                <>
                  <button className={`w-full ${colors.primaryBg} ${colors.primaryBgHover} text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 transition-colors`}>
                    <Zap size={18} />
                    Instant Apply
                  </button>
                  <p className="text-xs text-slate-500 text-center mb-4">
                    One-click application with pre-verified credentials
                  </p>
                </>
              ) : (
                <>
                  <button className={`w-full ${colors.primaryBg} ${colors.primaryBgHover} text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 transition-colors`}>
                    <Shield size={18} />
                    Make an Offer
                  </button>
                  <p className="text-xs text-slate-500 text-center mb-4">
                    Protected by Smart Escrow technology
                  </p>
                </>
              )}

              <div className="flex gap-3">
                <button className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                  <MessageSquare size={18} />
                  Message
                </button>
                <button className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                  <Phone size={18} />
                  Call
                </button>
              </div>
            </div>

            {/* Schedule Tour */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Schedule a Tour</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['Today', 'Tomorrow', 'Sat'].map((day, idx) => (
                  <button
                    key={day}
                    className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                      idx === 0 
                        ? `${colors.primaryBg} text-white` 
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['10:00 AM', '2:00 PM', '5:00 PM'].map((time) => (
                  <button
                    key={time}
                    className="py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
