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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/my-listings"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-luxury font-semibold text-slate-800">Edit Listing</h1>
            <p className="text-slate-600">Update your property details</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Check className="text-green-500" size={20} />
            <p className="text-green-700">Property updated successfully! Redirecting...</p>
          </div>
        )}

        {/* Error Message */}
        {error && formData.title && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateFormData('type', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PROPERTY_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => updateFormData('listingType', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {LISTING_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateFormData('status', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price {formData.listingType === 'RENT' ? '(per month)' : ''}
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {formData.listingType === 'RENT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => updateFormData('deposit', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Location</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Specifications</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                <div className="relative">
                  <Bed size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.bedrooms}
                    onChange={(e) => updateFormData('bedrooms', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                <div className="relative">
                  <Bath size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.bathrooms}
                    onChange={(e) => updateFormData('bathrooms', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Square Feet</label>
                <div className="relative">
                  <Square size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={formData.sqft}
                    onChange={(e) => updateFormData('sqft', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Available From</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => updateFormData('availableFrom', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700">Pet Friendly</span>
              </label>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Amenities & Features</h2>
            
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleFeature(amenity)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formData.features.includes(amenity)
                      ? `${colors.primaryBg} text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Photos</h2>

            {/* Existing Images */}
            {formData.existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">Current Photos</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.existingImages.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded">
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
                <p className="text-sm text-slate-600 mb-2">New Photos to Upload</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.newImages.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
              <Camera size={24} className="text-slate-400" />
              <span className="text-slate-600">Click to upload more photos</span>
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
              className="flex-1 py-4 border border-slate-200 rounded-xl font-semibold text-slate-700 text-center hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 ${colors.primaryBg} text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50`}
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
