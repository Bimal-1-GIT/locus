import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Camera, Edit2, Save, X, 
  LogOut, Bell, Shield, Home, Heart, MessageSquare,
  ChevronRight, Loader2
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { mode } = useMode();
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      setEditing(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { icon: Heart, label: 'Saved Properties', href: '/saved', count: 0 },
    { icon: MessageSquare, label: 'Messages', href: '/messages', count: 0 },
    { icon: Home, label: 'My Listings', href: '/my-listings', badge: user.role === 'LANDLORD' || user.role === 'SELLER' ? null : 'Pro' },
    { icon: Bell, label: 'Notifications', href: '/notifications', count: 3 },
    { icon: Shield, label: 'Privacy & Security', href: '/security' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Profile Header */}
      <div className={`${
        mode === 'buyer' 
          ? 'bg-gradient-to-br from-indigo-600 to-indigo-800' 
          : 'bg-gradient-to-br from-sage-600 to-sage-800'
      } pt-8 pb-24`}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-serif font-bold text-white">My Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Avatar Section */}
          <div className="relative px-6 pt-6 pb-4">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white ${
                  mode === 'buyer' ? 'bg-indigo-500' : 'bg-sage-500'
                }`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
                  )}
                </div>
                <button className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${
                  mode === 'buyer' ? 'bg-indigo-600' : 'bg-sage-600'
                }`}>
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
                        }`}
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
                        }`}
                      />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        mode === 'buyer' ? 'focus:ring-indigo-500' : 'focus:ring-sage-500'
                      }`}
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-gray-500">{user.email}</p>
                    {user.phone && (
                      <p className="text-gray-500 text-sm">{user.phone}</p>
                    )}
                  </>
                )}
                
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'LANDLORD' || user.role === 'SELLER'
                      ? 'bg-amber-100 text-amber-700'
                      : mode === 'buyer'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-sage-100 text-sage-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`p-2 rounded-lg text-white ${
                        mode === 'buyer' 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'bg-sage-600 hover:bg-sage-700'
                      }`}
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className={`p-2 rounded-lg text-white ${
                      mode === 'buyer' 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-sage-600 hover:bg-sage-700'
                    }`}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border-t border-b">
            <div className="px-6 py-4 text-center">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Saved</div>
            </div>
            <div className="px-6 py-4 text-center border-x">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Views</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Inquiries</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="divide-y">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mode === 'buyer' ? 'bg-indigo-100' : 'bg-sage-100'
                  }`}>
                    <item.icon className={`w-5 h-5 ${
                      mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
                    }`} />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      mode === 'buyer' 
                        ? 'bg-indigo-100 text-indigo-600' 
                        : 'bg-sage-100 text-sage-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-600">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900">{user.email}</div>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-gray-900">{user.phone}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Member Since</div>
                <div className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
