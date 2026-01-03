import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Home, Loader2 } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';

// Nepali Theme Colors
const NEPALI = {
  primary: '#8B0000',
  primaryDark: '#5C0000',
  gold: '#D4AF37',
  goldLight: '#E5C158',
  saffron: '#FF9933',
  cream: '#FDF5E6',
  creamDark: '#F5E6D3',
  brown: '#CD853F',
  text: '#2F1810',
  textMuted: '#6B4423',
};

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

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding with Nepali Theme */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NEPALI.primary} 0%, ${NEPALI.primaryDark} 100%)` }}>
        {/* Background Pattern - Nepali inspired */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: NEPALI.gold }} />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: NEPALI.saffron }} />
          {/* Mandala-inspired pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-40 opacity-20"
            style={{
              background: `linear-gradient(135deg, ${NEPALI.gold} 25%, transparent 25%),
                          linear-gradient(225deg, ${NEPALI.gold} 25%, transparent 25%)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(212, 175, 55, 0.3)', backdropFilter: 'blur(8px)' }}>
              <span className="text-2xl">🏔</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold">AuraEstate</span>
              <span className="text-xs" style={{ color: NEPALI.gold }}>नेपाल</span>
            </div>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-serif font-bold text-white leading-tight">
            Find Your Perfect<br />
            {mode === 'buyer' ? 'Home Investment' : 'Rental Space'}
          </h1>
          <p className="text-sm" style={{ color: NEPALI.gold }}>
            तपाईंको सपनाको घर खोज्नुहोस्
          </p>
          <p className="text-white/80 text-lg max-w-md">
            Join thousands of satisfied users who found their dream properties through our intelligent matching system.
          </p>
          
          <div className="flex items-center gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm" style={{ color: NEPALI.goldLight }}>Active Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-sm" style={{ color: NEPALI.goldLight }}>Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm" style={{ color: NEPALI.goldLight }}>Support</div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm" style={{ color: NEPALI.goldLight }}>
          © 2026 AuraEstate. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: NEPALI.cream }}>
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2" style={{ color: NEPALI.primary }}>
              <span className="text-2xl">🏔</span>
              <span className="text-xl font-serif font-bold">AuraEstate</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif font-bold" style={{ color: NEPALI.primary }}>Welcome back</h2>
            <p className="text-sm" style={{ color: NEPALI.gold }}>स्वागतम् फेरि</p>
            <p className="mt-2" style={{ color: NEPALI.textMuted }}>Sign in to continue your property search</p>
          </div>

          {/* Demo Account Buttons */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFAF0', border: `2px solid ${NEPALI.gold}` }}>
            <p className="text-sm font-medium mb-3" style={{ color: NEPALI.primary }}>Quick Demo Login:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('renter')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{ backgroundColor: NEPALI.creamDark, color: NEPALI.primary, border: `1px solid ${NEPALI.brown}` }}
              >
                Renter
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('landlord')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{ backgroundColor: NEPALI.creamDark, color: NEPALI.primary, border: `1px solid ${NEPALI.brown}` }}
              >
                Landlord
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('buyer')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{ backgroundColor: NEPALI.creamDark, color: NEPALI.primary, border: `1px solid ${NEPALI.brown}` }}
              >
                Buyer
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#FFF0F0', border: `2px solid ${NEPALI.primary}`, color: NEPALI.primary }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: NEPALI.text }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: NEPALI.brown }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    border: `2px solid ${NEPALI.brown}`,
                    backgroundColor: '#FFFDF9'
                  }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: NEPALI.text }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: NEPALI.brown }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    border: `2px solid ${NEPALI.brown}`,
                    backgroundColor: '#FFFDF9'
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: NEPALI.textMuted }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{ accentColor: NEPALI.primary }}
                />
                <span className="text-sm" style={{ color: NEPALI.textMuted }}>Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium hover:underline"
                style={{ color: NEPALI.primary }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: `linear-gradient(135deg, ${NEPALI.primary} 0%, #A52A2A 100%)`,
                boxShadow: `0 4px 0 ${NEPALI.primaryDark}`
              }}
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
              <div className="w-full" style={{ borderTop: `1px solid ${NEPALI.brown}` }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ backgroundColor: NEPALI.cream, color: NEPALI.textMuted }}>Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors hover:shadow-md"
              style={{ border: `2px solid ${NEPALI.brown}`, backgroundColor: '#FFFDF9' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: NEPALI.text }}>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors hover:shadow-md"
              style={{ border: `2px solid ${NEPALI.brown}`, backgroundColor: '#FFFDF9' }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: NEPALI.text }}>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: NEPALI.text }}>GitHub</span>
            </button>
          </div>

          <p className="text-center" style={{ color: NEPALI.textMuted }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-medium hover:underline"
              style={{ color: NEPALI.primary }}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
