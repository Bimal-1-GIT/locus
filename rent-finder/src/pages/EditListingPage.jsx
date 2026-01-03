import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Loader2, Camera, X, MapPin, 
  DollarSign, Bed, Bath, Square, Calendar, Check
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const PROPERTY_TYPES = [
  { id: 'APARTMENT', label: 'Apartment' },
  { id: 'HOUSE', label: 'House' },
  { id: 'CONDO', label: 'Condo' },
  { id: 'LOFT', label: 'Loft' },
  { id: 'TOWNHOUSE', label: 'Townhouse' },
  { id: 'STUDIO', label: 'Studio' },
];

const LISTING_TYPES = [
  { id: 'RENT', label: 'For Rent' },
  { id: 'SALE', label: 'For Sale' },
];

const STATUS_OPTIONS = [
  { id: 'ACTIVE', label: 'Active' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'RENTED', label: 'Rented' },
  { id: 'SOLD', label: 'Sold' },
  { id: 'INACTIVE', label: 'Inactive' },
];

const AMENITIES = [
  'In-Unit Laundry', 'Dishwasher', 'Parking', 'Elevator', 'Storage', 'Doorman',
  'Gym', 'Rooftop Access', 'Pet Friendly', 'Pool', 'Concierge', 'BBQ Area',
  'EV Charging', 'Smart Home Ready', 'Fiber Internet', 'Security System', 'Video Intercom',
  'High Ceilings', 'Natural Light', 'Balcony/Terrace', 'Fireplace', 'Hardwood Floors', 'City Views'
];

// Nepali-inspired color palette
const NEPALI_THEME = {
  primary: '#8B0000',        // Deep maroon/red from flag
  primaryDark: '#5C0000',    // Darker shade
  secondary: '#D4AF37',      // Temple gold
  accent: '#FF9933',         // Saffron orange
  background: '#FDF5E6',     // Cream/old lace
  cardBg: '#FFFAF0',         // Floral white
  border: '#CD853F',         // Earthy brown
  text: '#2F1810',           // Dark brown
  textMuted: '#6B4423',      // Muted brown
};

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useMode();
  const { isAuthenticated, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'APARTMENT',
    listingType: 'RENT',
    status: 'ACTIVE',
    price: '',
    deposit: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bedrooms: '1',
    bathrooms: '1',
    sqft: '',
    availableFrom: '',
    petFriendly: false,
    features: [],
    existingImages: [],
    newImages: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/edit-listing/${id}` } } });
      return;
    }
    fetchProperty();
  }, [id, isAuthenticated, navigate]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getProperty(id);
      const p = response.property;

      // Check ownership
      if (p.ownerId !== user?.id) {
        setError('You do not have permission to edit this property');
        return;
      }

      setFormData({
        title: p.title || '',
        description: p.description || '',
        type: p.type || 'APARTMENT',
        listingType: p.listingType || 'RENT',
        status: p.status || 'ACTIVE',
        price: p.price?.toString() || '',
        deposit: p.deposit?.toString() || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        zipCode: p.zipCode || '',
        bedrooms: p.bedrooms?.toString() || '1',
        bathrooms: p.bathrooms?.toString() || '1',
        sqft: p.sqft?.toString() || '',
        availableFrom: p.availableFrom ? p.availableFrom.split('T')[0] : '',
        petFriendly: p.petFriendly || false,
        features: p.features?.map(f => f.name) || [],
        existingImages: p.images || [],
        newImages: [],
      });
    } catch (err) {
      console.error('Failed to fetch property:', err);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setFormData(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...newImages]
    }));
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  const removeNewImage = (index) => {
    setFormData(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Upload new images first
      let uploadedImages = [];
      if (formData.newImages.length > 0) {
        try {
          const imageFiles = formData.newImages.map(img => img.file);
          const uploadResponse = await api.uploadImages(imageFiles);
          uploadedImages = uploadResponse.files.map((file, index) => ({
            url: file.url,
            isPrimary: formData.existingImages.length === 0 && index === 0
          }));
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
        }
      }

      // Combine existing and new images
      const allImages = [
        ...formData.existingImages.map((img, index) => ({
          url: img.url,
          isPrimary: index === 0
        })),
        ...uploadedImages
      ];

      const propertyData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        listingType: formData.listingType,
        status: formData.status,
        price: parseFloat(formData.price) || 0,
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseFloat(formData.bathrooms) || 1,
        sqft: parseInt(formData.sqft) || 0,
        availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
        petFriendly: formData.petFriendly,
        features: formData.features,
        images: allImages
      };

      await api.updateProperty(id, propertyData);
      setSuccess(true);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/my-listings');
      }, 1500);
    } catch (err) {
      console.error('Failed to update property:', err);
      setError(err.message || 'Failed to update listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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

  if (error && !formData.title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">{error}</h2>
          <Link to="/my-listings" className={`${colors.primaryText} hover:underline`}>
            Back to My Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: NEPALI_THEME.background }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Nepali decorative border */}
        <div className="flex items-center gap-4 mb-8 pb-4" style={{ borderBottom: `4px double ${NEPALI_THEME.primary}` }}>
          <Link
            to="/my-listings"
            className="p-2 rounded-lg border-2 transition-colors hover:bg-amber-50"
            style={{ borderColor: NEPALI_THEME.secondary, color: NEPALI_THEME.primary }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: NEPALI_THEME.primary }}>
              Edit Listing
              <span className="block text-sm font-normal" style={{ color: NEPALI_THEME.textMuted }}>सम्पादन गर्नुहोस्</span>
            </h1>
            <p style={{ color: NEPALI_THEME.textMuted }}>Update your property details</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-xl p-4 mb-6 flex items-center gap-3" style={{ backgroundColor: '#E8F5E9', border: `2px solid ${NEPALI_THEME.secondary}` }}>
            <Check style={{ color: NEPALI_THEME.secondary }} size={20} />
            <p style={{ color: NEPALI_THEME.text }}>Property updated successfully! Redirecting...</p>
          </div>
        )}

        {/* Error Message */}
        {error && formData.title && (
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#FFF0F0', border: `2px solid ${NEPALI_THEME.primary}` }}>
            <p style={{ color: NEPALI_THEME.primary }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{ backgroundColor: NEPALI_THEME.cardBg, border: `2px solid ${NEPALI_THEME.secondary}` }}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{ background: `radial-gradient(circle at 100% 0%, ${NEPALI_THEME.primary} 0%, transparent 70%)` }} />
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: NEPALI_THEME.primary }}>
              <span style={{ color: NEPALI_THEME.secondary }}>◈</span>
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 resize-none transition-all"
                  style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Property Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateFormData('type', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                  >
                    {PROPERTY_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Listing Type</label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => updateFormData('listingType', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                  >
                    {LISTING_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateFormData('status', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{ backgroundColor: NEPALI_THEME.cardBg, border: `2px solid ${NEPALI_THEME.secondary}` }}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{ background: `radial-gradient(circle at 100% 0%, ${NEPALI_THEME.primary} 0%, transparent 70%)` }} />
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: NEPALI_THEME.primary }}>
              <span style={{ color: NEPALI_THEME.secondary }}>◈</span>
              Pricing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>
                  Price {formData.listingType === 'RENT' ? '(per month)' : ''}
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: NEPALI_THEME.border }} />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                    required
                  />
                </div>
              </div>

              {formData.listingType === 'RENT' && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Security Deposit</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: NEPALI_THEME.border }} />
                    <input
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => updateFormData('deposit', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{ backgroundColor: NEPALI_THEME.cardBg, border: `2px solid ${NEPALI_THEME.secondary}` }}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{ background: `radial-gradient(circle at 100% 0%, ${NEPALI_THEME.primary} 0%, transparent 70%)` }} />
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: NEPALI_THEME.primary }}>
              <span style={{ color: NEPALI_THEME.secondary }}>◈</span>
              Location
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Street Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: NEPALI_THEME.border }} />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{ backgroundColor: NEPALI_THEME.cardBg, border: `2px solid ${NEPALI_THEME.secondary}` }}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{ background: `radial-gradient(circle at 100% 0%, ${NEPALI_THEME.primary} 0%, transparent 70%)` }} />
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: NEPALI_THEME.primary }}>
              <span style={{ color: NEPALI_THEME.secondary }}>◈</span>
              Specifications
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Bedrooms</label>
                <div className="relative">
                  <Bed size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: NEPALI_THEME.border }} />
                  <select
                    value={formData.bedrooms}
                    onChange={(e) => updateFormData('bedrooms', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                  >
                    <option value="0">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Bathrooms</label>
                <div className="relative">
                  <Bath size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: NEPALI_THEME.border }} />
                  <select
                    value={formData.bathrooms}
                    onChange={(e) => updateFormData('bathrooms', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                  >
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="2.5">2.5</option>
                    <option value="3">3+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Square Feet</label>
                <div className="relative">
                  <Square size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: NEPALI_THEME.border }} />
                  <input
                    type="number"
                    value={formData.sqft}
                    onChange={(e) => updateFormData('sqft', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NEPALI_THEME.text }}>Available From</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: NEPALI_THEME.border }} />
                  <input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => updateFormData('availableFrom', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `2px solid ${NEPALI_THEME.border}`, backgroundColor: '#FFFDF9' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.petFriendly}
                  onChange={(e) => updateFormData('petFriendly', e.target.checked)}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: NEPALI_THEME.primary }}
                />
                <span style={{ color: NEPALI_THEME.text }}>Pet Friendly</span>
              </label>
            </div>
          </div>

          {/* Amenities */}
          <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{ backgroundColor: NEPALI_THEME.cardBg, border: `2px solid ${NEPALI_THEME.secondary}` }}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{ background: `radial-gradient(circle at 100% 0%, ${NEPALI_THEME.primary} 0%, transparent 70%)` }} />
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: NEPALI_THEME.primary }}>
              <span style={{ color: NEPALI_THEME.secondary }}>◈</span>
              Amenities & Features
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleFeature(amenity)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: formData.features.includes(amenity) ? NEPALI_THEME.primary : '#F5E6D3',
                    color: formData.features.includes(amenity) ? '#FFFFFF' : NEPALI_THEME.text,
                    border: `2px solid ${formData.features.includes(amenity) ? NEPALI_THEME.primary : NEPALI_THEME.border}`
                  }}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{ backgroundColor: NEPALI_THEME.cardBg, border: `2px solid ${NEPALI_THEME.secondary}` }}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{ background: `radial-gradient(circle at 100% 0%, ${NEPALI_THEME.primary} 0%, transparent 70%)` }} />
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: NEPALI_THEME.primary }}>
              <span style={{ color: NEPALI_THEME.secondary }}>◈</span>
              Photos
            </h2>

            {/* Existing Images */}
            {formData.existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: NEPALI_THEME.textMuted }}>Current Photos</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.existingImages.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden" style={{ backgroundColor: '#F5E6D3' }}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 text-white rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: NEPALI_THEME.primary }}
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 text-white text-xs rounded" style={{ backgroundColor: NEPALI_THEME.secondary }}>
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {formData.newImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: NEPALI_THEME.textMuted }}>New Photos to Upload</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.newImages.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden" style={{ backgroundColor: '#F5E6D3' }}>
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 text-white rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: NEPALI_THEME.primary }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <label 
              className="flex items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:shadow-md"
              style={{ borderColor: NEPALI_THEME.border, backgroundColor: '#FFFDF9' }}
            >
              <Camera size={24} style={{ color: NEPALI_THEME.border }} />
              <span style={{ color: NEPALI_THEME.textMuted }}>Click to upload more photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              to="/my-listings"
              className="flex-1 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-md"
              style={{ 
                border: `2px solid ${NEPALI_THEME.border}`,
                color: NEPALI_THEME.text,
                backgroundColor: '#FFFDF9'
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${NEPALI_THEME.primary} 0%, #A52A2A 100%)`,
                boxShadow: `0 4px 0 ${NEPALI_THEME.primaryDark}`
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
