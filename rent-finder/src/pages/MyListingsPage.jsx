import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  MoreVertical,
  Loader2,
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function MyListingsPage() {
  const { colors } = useMode();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/my-listings' } } });
      return;
    }
    fetchListings();
  }, [isAuthenticated, navigate]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getMyListings();
      setListings(response.properties || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;
    
    try {
      setDeletingId(propertyToDelete.id);
      await api.deleteProperty(propertyToDelete.id);
      setListings(listings.filter(l => l.id !== propertyToDelete.id));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price, listingType) => {
    if (listingType === 'RENT') {
      return `$${price.toLocaleString()}/mo`;
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      RENTED: 'bg-blue-100 text-blue-700',
      SOLD: 'bg-purple-100 text-purple-700',
      INACTIVE: 'bg-slate-100 text-slate-700',
    };
    return styles[status] || styles.INACTIVE;
  };

  // Stats calculations
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'ACTIVE').length,
    totalViews: listings.reduce((sum, l) => sum + (l.viewCount || 0), 0),
    totalSaved: listings.reduce((sum, l) => sum + (l._count?.savedBy || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-luxury font-semibold text-slate-800">My Listings</h1>
            <p className="text-slate-600 mt-1">Manage your property listings</p>
          </div>
          <Link
            to="/list-property"
            className={`${colors.primaryBg} text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity`}
          >
            <Plus size={20} />
            Add New Listing
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Building2 size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-sm text-slate-500">Total Listings</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.active}</p>
                <p className="text-sm text-slate-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Eye size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalViews}</p>
                <p className="text-sm text-slate-500">Total Views</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Users size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalSaved}</p>
                <p className="text-sm text-slate-500">Saves</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Building2 size={40} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No listings yet</h2>
            <p className="text-slate-600 mb-6">Start by creating your first property listing</p>
            <Link
              to="/list-property"
              className={`${colors.primaryBg} text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity`}
            >
              <Plus size={20} />
              Create Your First Listing
            </Link>
          </div>
        )}

        {/* Listings Grid */}
        {listings.length > 0 && (
          <div className="grid gap-6">
            {listings.map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-64 h-48 md:h-auto relative flex-shrink-0">
                    <img
                      src={property.images?.[0]?.url || 'https://picsum.photos/seed/default/400/300'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      property.listingType === 'RENT' ? 'bg-sage-400 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      {property.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">{property.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(property.status)}`}>
                            {property.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
                          <MapPin size={14} />
                          <span>{property.address}, {property.city}, {property.state}</span>
                        </div>
                        <p className={`text-xl font-bold ${colors.primaryText}`}>
                          {formatPrice(property.price, property.listingType)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/property/${property.id}`}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/edit-listing/${property.id}`}
                          className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(property)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Bed size={16} />
                        <span className="text-sm">{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Beds`}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Bath size={16} />
                        <span className="text-sm">{property.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Square size={16} />
                        <span className="text-sm">{property.sqft?.toLocaleString() || 'N/A'} sqft</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Eye size={16} />
                        <span className="text-sm">{property.viewCount || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Users size={16} />
                        <span className="text-sm">{property._count?.savedBy || 0} saved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Delete Listing</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPropertyToDelete(null);
                }}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === propertyToDelete?.id}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === propertyToDelete?.id ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
