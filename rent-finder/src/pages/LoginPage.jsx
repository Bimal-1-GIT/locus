import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Home, Loader2 } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { mode } = useMode();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  const fillDemoAccount = (type) => {
    const accounts = {
      renter: { email: 'renter@demo.com', password: 'password123' },
      landlord: { email: 'landlord@demo.com', password: 'password123' },
      buyer: { email: 'buyer@demo.com', password: 'password123' },
    };
    setFormData(accounts[type]);
    setError('');
  };

  const accentColor = mode === 'buyer' ? 'indigo' : 'sage';

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 ${
        mode === 'buyer' 
          ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800' 
          : 'bg-gradient-to-br from-sage-600 via-sage-700 to-emerald-800'
      } p-12 flex-col justify-between relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Home className="w-7 h-7" />
            </div>
            <span className="text-2xl font-serif font-bold">AuraEstate</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-serif font-bold text-white leading-tight">
            Find Your Perfect<br />
            {mode === 'buyer' ? 'Home Investment' : 'Rental Space'}
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Join thousands of satisfied users who found their dream properties through our intelligent matching system.
          </p>
          
          <div className="flex items-center gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-white/70 text-sm">Active Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-white/70 text-sm">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-white/70 text-sm">Support</div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-white/60 text-sm">
          © 2026 AuraEstate. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className={`inline-flex items-center gap-2 ${
              mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
            }`}>
              <Home className="w-8 h-8" />
              <span className="text-xl font-serif font-bold">AuraEstate</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">Sign in to continue your property search</p>
          </div>

          {/* Demo Account Buttons */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-medium mb-3">Quick Demo Login:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('renter')}
                className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Renter
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('landlord')}
                className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Landlord
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('buyer')}
                className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Buyer
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
                    mode === 'buyer' 
                      ? 'focus:ring-indigo-500 focus:border-indigo-500' 
                      : 'focus:ring-sage-500 focus:border-sage-500'
                  } transition-colors`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
                    mode === 'buyer' 
                      ? 'focus:ring-indigo-500 focus:border-indigo-500' 
                      : 'focus:ring-sage-500 focus:border-sage-500'
                  } transition-colors`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className={`w-4 h-4 rounded border-gray-300 ${
                    mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
                  } focus:ring-offset-0`}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className={`text-sm font-medium ${
                  mode === 'buyer' ? 'text-indigo-600 hover:text-indigo-500' : 'text-sage-600 hover:text-sage-500'
                }`}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${
                mode === 'buyer'
                  ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400'
                  : 'bg-sage-600 hover:bg-sage-700 disabled:bg-sage-400'
              } disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">GitHub</span>
            </button>
          </div>

          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className={`font-medium ${
                mode === 'buyer' ? 'text-indigo-600 hover:text-indigo-500' : 'text-sage-600 hover:text-sage-500'
              }`}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
