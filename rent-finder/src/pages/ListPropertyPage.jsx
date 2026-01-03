import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, Building2, Key, CheckCircle2, Sparkles, Camera,
  MapPin, DollarSign, Calendar, Bed, Bath, Square,
  Zap, Wifi, Car, Dog, Dumbbell, Waves, Sun, Flame,
  Upload, X, ChevronRight, ChevronLeft, Eye, Share2,
  LayoutDashboard, ArrowRight, Play, Shield, Brain
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STEPS = [
  { id: 0, title: 'Welcome', icon: Home },
  { id: 1, title: 'Fundamentals', icon: Building2 },
  { id: 2, title: 'Specifications', icon: Square },
  { id: 3, title: 'Amenities', icon: Sparkles },
  { id: 4, title: 'Media', icon: Camera },
  { id: 5, title: 'Review', icon: CheckCircle2 },
  { id: 6, title: 'Success', icon: CheckCircle2 },
];

const PROPERTY_TYPES = [
  { id: 'APARTMENT', label: 'Apartment', icon: '🏢' },
  { id: 'HOUSE', label: 'House', icon: '🏠' },
  { id: 'CONDO', label: 'Condo', icon: '🏙️' },
  { id: 'LOFT', label: 'Loft', icon: '🏭' },
  { id: 'TOWNHOUSE', label: 'Townhouse', icon: '🏘️' },
  { id: 'STUDIO', label: 'Studio', icon: '🛋️' },
];

const AMENITIES = {
  convenience: {
    label: 'Convenience',
    icon: Zap,
    items: ['In-Unit Laundry', 'Dishwasher', 'Parking', 'Elevator', 'Storage', 'Doorman']
  },
  lifestyle: {
    label: 'Lifestyle',
    icon: Dumbbell,
    items: ['Gym', 'Rooftop Access', 'Pet Friendly', 'Pool', 'Concierge', 'BBQ Area']
  },
  technology: {
    label: 'Technology',
    icon: Wifi,
    items: ['EV Charging', 'Smart Home Ready', 'Fiber Internet', 'Security System', 'Video Intercom']
  },
  atmosphere: {
    label: 'Atmosphere',
    icon: Sun,
    items: ['High Ceilings', 'Natural Light', 'Balcony/Terrace', 'Fireplace', 'Hardwood Floors', 'City Views']
  }
};

export default function ListPropertyPage() {
  const { mode } = useMode();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  
  const [formData, setFormData] = useState({
    // Step 1: Fundamentals
    title: '',
    listingType: 'RENT',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: '',
    
    // Step 2: Specifications
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    availableFrom: '',
    deposit: '',
    
    // Step 3: Amenities
    amenities: [],
    
    // Step 4: Media
    images: [],
    description: '',
    
    // Step 5: Review
    certifyOwner: false,
    agreeToTerms: false,
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
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
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const generateAIDescription = () => {
    // Simulated AI description generation
    const description = `Welcome to this stunning ${formData.propertyType.toLowerCase() || 'property'} located in the heart of ${formData.city || 'the city'}. 

This ${formData.bedrooms || 'spacious'}-bedroom, ${formData.bathrooms || 'modern'}-bathroom residence offers ${formData.sqft || 'generous'} sq ft of thoughtfully designed living space. 

${formData.amenities.length > 0 ? `Key features include: ${formData.amenities.slice(0, 5).join(', ')}.` : ''}

The property boasts an exceptional blend of comfort and style, perfect for those seeking a sophisticated urban lifestyle. Natural light floods through large windows, creating an inviting atmosphere throughout.

Schedule a tour today and experience the unique charm of this exceptional home!`;
    
    updateFormData('description', description);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/list-property' } } });
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Upload images first if any
      let uploadedImages = [];
      if (formData.images.length > 0) {
        try {
          console.log('Uploading images:', formData.images.length);
          const imageFiles = formData.images.map(img => img.file);
          console.log('Image files to upload:', imageFiles);
          const uploadResponse = await api.uploadImages(imageFiles);
          console.log('Upload response:', uploadResponse);
          uploadedImages = uploadResponse.files.map((file, index) => ({
            url: file.url,
            isPrimary: index === 0
          }));
          console.log('Uploaded images URLs:', uploadedImages);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Fallback to placeholder images if upload fails
          uploadedImages = formData.images.map((img, index) => {
            const seed = `${formData.title?.replace(/\s+/g, '-') || 'property'}-${Date.now()}-${index}`;
            return {
              url: `https://picsum.photos/seed/${seed}/800/600`,
              isPrimary: index === 0
            };
          });
        }
      } else {
        // No images uploaded, use placeholder
        console.log('No images to upload, using placeholder');
        const seed = `${formData.title?.replace(/\s+/g, '-') || 'default'}-${Date.now()}`;
        uploadedImages = [{ url: `https://picsum.photos/seed/${seed}/800/600`, isPrimary: true }];
      }

      // Prepare property data for API
      const propertyData = {
        title: formData.title,
        description: formData.description,
        type: formData.propertyType,
        listingType: formData.listingType,
        price: parseFloat(formData.price) || 0,
        priceType: formData.listingType === 'RENT' ? 'MONTHLY' : 'TOTAL',
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        bedrooms: formData.bedrooms === 'Studio' ? 0 : (formData.bedrooms === '4+' ? 4 : parseInt(formData.bedrooms) || 0),
        bathrooms: parseFloat(formData.bathrooms?.replace('+', '')) || 1,
        sqft: parseInt(formData.sqft) || 0,
        availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
        petFriendly: formData.amenities.includes('Pet Friendly'),
        features: formData.amenities,
        images: uploadedImages
      };

      const response = await api.createProperty(propertyData);
      setCreatedPropertyId(response.property.id);
      setCurrentStep(6); // Success step
    } catch (error) {
      console.error('Failed to create property:', error);
      setSubmitError(error.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const accentColor = mode === 'buyer' ? 'indigo' : 'sage';

  // Landing Page (Step 0)
  if (currentStep === 0) {
    return <LandingSection onStart={() => setCurrentStep(1)} mode={mode} />;
  }

  // Success Page (Step 6)
  if (currentStep === 6) {
    return <SuccessSection formData={formData} mode={mode} propertyId={createdPropertyId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <X className="w-5 h-5" />
              <span className="text-sm">Exit</span>
            </Link>
            <span className="text-sm text-gray-500">Step {currentStep} of 5</span>
            <button 
              onClick={() => {/* Save draft */}}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Save Draft
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div 
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step <= currentStep 
                    ? mode === 'buyer' ? 'bg-indigo-600' : 'bg-sage-600'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {currentStep === 1 && (
          <Step1Fundamentals 
            formData={formData} 
            updateFormData={updateFormData} 
            mode={mode}
          />
        )}
        {currentStep === 2 && (
          <Step2Specifications 
            formData={formData} 
            updateFormData={updateFormData} 
            mode={mode}
          />
        )}
        {currentStep === 3 && (
          <Step3Amenities 
            formData={formData} 
            toggleAmenity={toggleAmenity} 
            mode={mode}
          />
        )}
        {currentStep === 4 && (
          <Step4Media 
            formData={formData} 
            updateFormData={updateFormData}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            generateAIDescription={generateAIDescription}
            mode={mode}
          />
        )}
        {currentStep === 5 && (
          <Step5Review 
            formData={formData} 
            updateFormData={updateFormData}
            mode={mode}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {submitError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {submitError}
            </div>
          )}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white transition-colors ${
                  mode === 'buyer' 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-sage-600 hover:bg-sage-700'
                }`}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.certifyOwner || !formData.agreeToTerms}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === 'buyer' 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-sage-600 hover:bg-sage-700'
                }`}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Listing Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Landing Section Component
function LandingSection({ onStart, mode }) {
  const benefits = [
    {
      icon: Play,
      title: '3D Immersive Tours',
      description: 'Give prospective tenants a feel for the space without leaving their couch.'
    },
    {
      icon: Brain,
      title: 'SmartMatch AI',
      description: 'We show your listing to the people most likely to love it based on their lifestyle data.'
    },
    {
      icon: Shield,
      title: 'Zero-Stress Paperwork',
      description: 'Integrated digital leases, background checks, and automated deposits.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className={`${
        mode === 'buyer' 
          ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800' 
          : 'bg-gradient-to-br from-sage-600 via-sage-700 to-emerald-800'
      } text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-serif font-bold mb-6">
              List Your Property on AuraEstate
            </h1>
            <p className="text-xl text-white/80 mb-10">
              Reach high-intent residents and buyers with the most immersive property platform in the world.
            </p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                mode === 'buyer' ? 'bg-indigo-100' : 'bg-sage-100'
              }`}>
                <benefit.icon className={`w-7 h-7 ${
                  mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
                }`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '50K+', label: 'Active Listings' },
            { value: '2.5M', label: 'Monthly Visitors' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '< 7 days', label: 'Avg. Time to Rent' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl font-bold ${
                mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
              }`}>{stat.value}</div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <button
            onClick={onStart}
            className={`inline-flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-white transition-colors ${
              mode === 'buyer' 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-sage-600 hover:bg-sage-700'
            }`}
          >
            Start Listing Your Property
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 1: Fundamentals
function Step1Fundamentals({ formData, updateFormData, mode }) {
  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          First, let's identify your property
        </h2>
        <p className="text-gray-600">Tell us the basics about your listing</p>
      </div>

      {/* Property Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder='e.g., "Modern Penthouse with Skyline Views"'
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
            mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
          }`}
        />
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Listing Type
        </label>
        <div className="flex gap-4">
          {[
            { id: 'RENT', label: 'For Rent', icon: Key },
            { id: 'SALE', label: 'For Sale', icon: Building2 },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => updateFormData('listingType', type.id)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                formData.listingType === type.id
                  ? mode === 'buyer'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-sage-600 bg-sage-50 text-sage-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <type.icon className="w-5 h-5" />
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Property Address */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Property Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            placeholder="Street address"
            className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
              mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
            }`}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            placeholder="City"
            className={`px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
              mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
            }`}
          />
          <input
            type="text"
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            placeholder="State"
            className={`px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
              mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
            }`}
          />
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => updateFormData('zipCode', e.target.value)}
            placeholder="ZIP Code"
            className={`px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
              mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
            }`}
          />
        </div>
      </div>

      {/* Property Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Property Category
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => updateFormData('propertyType', type.id)}
              className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                formData.propertyType === type.id
                  ? mode === 'buyer'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-sage-600 bg-sage-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-sm font-medium text-gray-700">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 2: Specifications
function Step2Specifications({ formData, updateFormData, mode }) {
  const bedroomOptions = ['Studio', '1', '2', '3', '4+'];
  const bathroomOptions = ['1', '1.5', '2', '2.5', '3+'];

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Tell us about the space
        </h2>
        <p className="text-gray-600">Specifications help tenants find their perfect match</p>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.listingType === 'RENT' ? 'Monthly Rent' : 'Asking Price'}
        </label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.price}
            onChange={(e) => updateFormData('price', e.target.value)}
            placeholder="0.00"
            className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
              mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
            }`}
          />
        </div>
        {formData.listingType === 'RENT' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Deposit
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.deposit}
                onChange={(e) => updateFormData('deposit', e.target.value)}
                placeholder="0.00"
                className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
                  mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Bed className="inline w-4 h-4 mr-2" />
          Bedrooms
        </label>
        <div className="flex gap-2">
          {bedroomOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateFormData('bedrooms', option)}
              className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                formData.bedrooms === option
                  ? mode === 'buyer'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-sage-600 bg-sage-50 text-sage-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Bath className="inline w-4 h-4 mr-2" />
          Bathrooms
        </label>
        <div className="flex gap-2">
          {bathroomOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateFormData('bathrooms', option)}
              className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                formData.bathrooms === option
                  ? mode === 'buyer'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-sage-600 bg-sage-50 text-sage-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Square Footage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Square className="inline w-4 h-4 mr-2" />
          Square Footage
        </label>
        <input
          type="text"
          value={formData.sqft}
          onChange={(e) => updateFormData('sqft', e.target.value)}
          placeholder="Total living area in sq. ft."
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
            mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
          }`}
        />
      </div>

      {/* Availability Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-2" />
          Availability Date
        </label>
        <input
          type="date"
          value={formData.availableFrom}
          onChange={(e) => updateFormData('availableFrom', e.target.value)}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
            mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
          }`}
        />
      </div>
    </div>
  );
}

// Step 3: Amenities
function Step3Amenities({ formData, toggleAmenity, mode }) {
  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          What makes this home special?
        </h2>
        <p className="text-gray-600">Select the features that enhance the living experience</p>
      </div>

      {Object.entries(AMENITIES).map(([key, category]) => (
        <div key={key}>
          <div className="flex items-center gap-2 mb-4">
            <category.icon className={`w-5 h-5 ${
              mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
            }`} />
            <h3 className="font-semibold text-gray-900">{category.label}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {category.items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  formData.amenities.includes(item)
                    ? mode === 'buyer'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-sage-600 bg-sage-50 text-sage-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Selected count */}
      {formData.amenities.length > 0 && (
        <div className={`p-4 rounded-xl ${
          mode === 'buyer' ? 'bg-indigo-50' : 'bg-sage-50'
        }`}>
          <p className={`text-sm font-medium ${
            mode === 'buyer' ? 'text-indigo-700' : 'text-sage-700'
          }`}>
            ✓ {formData.amenities.length} amenities selected
          </p>
        </div>
      )}
    </div>
  );
}

// Step 4: Media & Description
function Step4Media({ formData, updateFormData, handleImageUpload, removeImage, generateAIDescription, mode }) {
  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          The Visual Showcase
        </h2>
        <p className="text-gray-600">High-quality photos increase engagement by 70%</p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Property Photos
        </label>
        <div className={`border-2 border-dashed rounded-xl p-8 text-center ${
          mode === 'buyer' ? 'border-indigo-300 bg-indigo-50/50' : 'border-sage-300 bg-sage-50/50'
        }`}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              mode === 'buyer' ? 'text-indigo-400' : 'text-sage-400'
            }`} />
            <p className="text-gray-600 mb-2">
              <span className={`font-medium ${
                mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
              }`}>Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG up to 10MB each
            </p>
          </label>
        </div>

        {/* Image Preview Grid */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    Cover Photo
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Property Description
          </label>
          <button
            type="button"
            onClick={generateAIDescription}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'buyer'
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </button>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe the neighborhood vibe and the unique character of the home..."
          rows={8}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 resize-none ${
            mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
          }`}
        />
        <p className="text-sm text-gray-500 mt-2">
          {formData.description.length} characters
        </p>
      </div>
    </div>
  );
}

// Step 5: Review
function Step5Review({ formData, updateFormData, mode }) {
  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Almost there!
        </h2>
        <p className="text-gray-600">Review your listing before publishing</p>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
        {formData.images.length > 0 && (
          <div className="aspect-video bg-gray-100">
            <img
              src={formData.images[0].preview}
              alt="Property"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {formData.title || 'Untitled Property'}
              </h3>
              <p className="text-gray-500">
                {formData.address && `${formData.address}, `}
                {formData.city && `${formData.city}, `}
                {formData.state} {formData.zipCode}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.listingType === 'RENT'
                ? 'bg-sage-100 text-sage-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}>
              For {formData.listingType === 'RENT' ? 'Rent' : 'Sale'}
            </div>
          </div>

          <div className="flex items-center gap-6 text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {formData.bedrooms || '–'} bed
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {formData.bathrooms || '–'} bath
            </span>
            <span className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              {formData.sqft || '–'} sqft
            </span>
          </div>

          <div className={`text-2xl font-bold ${
            mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
          }`}>
            ${formData.price || '0'}
            {formData.listingType === 'RENT' && <span className="text-base font-normal text-gray-500">/mo</span>}
          </div>

          {formData.amenities.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {formData.amenities.slice(0, 6).map((amenity) => (
                  <span key={amenity} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    {amenity}
                  </span>
                ))}
                {formData.amenities.length > 6 && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    +{formData.amenities.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.certifyOwner}
            onChange={(e) => updateFormData('certifyOwner', e.target.checked)}
            className={`mt-1 w-5 h-5 rounded ${
              mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
            }`}
          />
          <span className="text-gray-700">
            I certify that I am the owner or authorized representative of this property.
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
            className={`mt-1 w-5 h-5 rounded ${
              mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
            }`}
          />
          <span className="text-gray-700">
            I agree to the AuraEstate{' '}
            <a href="/fair-housing" className={`${
              mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
            } hover:underline`}>Fair Housing</a>
            {' '}and{' '}
            <a href="/privacy" className={`${
              mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
            } hover:underline`}>Privacy Policies</a>.
          </span>
        </label>
      </div>
    </div>
  );
}

// Success Section
function SuccessSection({ formData, mode, propertyId }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
          mode === 'buyer' ? 'bg-indigo-100' : 'bg-sage-100'
        }`}>
          <CheckCircle2 className={`w-10 h-10 ${
            mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
          }`} />
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
          Your listing is live!
        </h1>
        <p className="text-gray-600 text-lg mb-10">
          Our AI is now matching your property with potential residents. 
          You can track views, favorites, and inquiries from your Dashboard.
        </p>

        <div className="space-y-3">
          <Link
            to={`/property/${propertyId}`}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium text-white transition-colors ${
              mode === 'buyer' 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-sage-600 hover:bg-sage-700'
            }`}
          >
            <Eye className="w-5 h-5" />
            View Public Listing
          </Link>

          <Link
            to="/search"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Browse All Properties
          </Link>
          
          <button
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share to Social Media
          </button>
        </div>
      </div>
    </div>
  );
}
