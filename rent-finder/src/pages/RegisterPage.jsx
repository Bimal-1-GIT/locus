import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Home, Loader2, Check } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { mode, setMode } = useMode();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: mode === 'buyer' ? 'BUYER' : 'RENTER',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'RENTER', label: 'Renter', description: 'Looking for a place to rent', icon: '🏠' },
    { id: 'BUYER', label: 'Buyer', description: 'Looking to purchase property', icon: '🏡' },
    { id: 'LANDLORD', label: 'Landlord', description: 'I have properties to rent', icon: '🔑' },
    { id: 'SELLER', label: 'Seller', description: 'I want to sell property', icon: '💰' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
    // Update app mode based on role
    if (role === 'RENTER' || role === 'LANDLORD') {
      setMode('renter');
    } else {
      setMode('buyer');
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.agreeToTerms) return 'You must agree to the terms and conditions';
    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (error) {
      setError(error);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateStep2();
    if (error) {
      setError(error);
      return;
    }

    setLoading(true);
    setError('');

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password,
      role: formData.role,
    });
    
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = passwordStrength();

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
            Start Your Journey<br />
            to the Perfect Home
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Create your account and unlock access to thousands of curated properties, 
            personalized recommendations, and exclusive features.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span>AI-powered property matching</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span>Save and compare favorites</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span>Direct messaging with owners</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-white/60 text-sm">
          © 2026 AuraEstate. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
            <h2 className="text-3xl font-serif font-bold text-gray-900">Create account</h2>
            <p className="mt-2 text-gray-600">
              {step === 1 ? 'Enter your details to get started' : 'Set up your password'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${
              mode === 'buyer' ? 'bg-indigo-600' : 'bg-sage-600'
            }`} />
            <div className={`flex-1 h-2 rounded-full ${
              step >= 2 
                ? (mode === 'buyer' ? 'bg-indigo-600' : 'bg-sage-600')
                : 'bg-gray-200'
            }`} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.role === role.id
                            ? mode === 'buyer'
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-sage-600 bg-sage-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{role.icon}</span>
                        <div className="mt-2 font-medium text-gray-900">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
                          mode === 'buyer' 
                            ? 'focus:ring-indigo-500 focus:border-indigo-500' 
                            : 'focus:ring-sage-500 focus:border-sage-500'
                        }`}
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
                        mode === 'buyer' 
                          ? 'focus:ring-indigo-500 focus:border-indigo-500' 
                          : 'focus:ring-sage-500 focus:border-sage-500'
                      }`}
                      placeholder="Doe"
                    />
                  </div>
                </div>

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
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
                        mode === 'buyer' 
                          ? 'focus:ring-indigo-500 focus:border-indigo-500' 
                          : 'focus:ring-sage-500 focus:border-sage-500'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all ${
                    mode === 'buyer'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-sage-600 hover:bg-sage-700'
                  }`}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
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
                      }`}
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
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i <= strength.score ? strength.color : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${
                        strength.score <= 2 ? 'text-red-600' : 
                        strength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {strength.label} password
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${
                        mode === 'buyer' 
                          ? 'focus:ring-indigo-500 focus:border-indigo-500' 
                          : 'focus:ring-sage-500 focus:border-sage-500'
                      } ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-300'
                          : ''
                      }`}
                      placeholder="••••••••"
                    />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`mt-1 w-4 h-4 rounded border-gray-300 ${
                      mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
                    } focus:ring-offset-0`}
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className={`font-medium ${
                      mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
                    }`}>
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className={`font-medium ${
                      mode === 'buyer' ? 'text-indigo-600' : 'text-sage-600'
                    }`}>
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${
                      mode === 'buyer'
                        ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400'
                        : 'bg-sage-600 hover:bg-sage-700 disabled:bg-sage-400'
                    } disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className={`font-medium ${
                mode === 'buyer' ? 'text-indigo-600 hover:text-indigo-500' : 'text-sage-600 hover:text-sage-500'
              }`}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
