import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLeaf, FaUser, FaStar, FaStore, FaCrown, FaCheck, FaTimes } from 'react-icons/fa';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { validateForm, validatePassword, getPasswordStrength, getValidationMessage, validateEmail } from '../../utils/validation';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Role selection, 2: Form
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    professionalId: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldMessages, setFieldMessages] = useState({});
  const [emailValidation, setEmailValidation] = useState({
    isChecking: false,
    isValid: null,
    message: '',
    exists: null
  });

  // Email validation function
  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || !validateEmail(email)) {
      setEmailValidation({
        isChecking: false,
        isValid: false,
        message: 'Please enter a valid email address',
        exists: null
      });
      return;
    }

    setEmailValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setEmailValidation({
          isChecking: false,
          isValid: !data.exists,
          message: data.exists ? 'Email already registered' : 'Email available',
          exists: data.exists
        });
      } else {
        setEmailValidation({
          isChecking: false,
          isValid: null,
          message: 'Unable to verify email',
          exists: null
        });
      }
    } catch (error) {
      console.error('Email validation error:', error);
      setEmailValidation({
        isChecking: false,
        isValid: null,
        message: 'Unable to verify email',
        exists: null
      });
    }
  }, []);

  // Debounced email validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email);
      } else {
        setEmailValidation({
          isChecking: false,
          isValid: null,
          message: '',
          exists: null
        });
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.email, checkEmailAvailability]);

  const roles = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'New to plant care and looking to learn',
      icon: FaUser,
      color: 'bg-blue-500',
      features: ['Plant care guides', 'Basic tutorials', 'Community support']
    },
    {
      id: 'expert',
      title: 'Expert',
      description: 'Experienced gardener sharing knowledge',
      icon: FaStar,
      color: 'bg-purple-500',
      features: ['Create content', 'Answer questions', 'Expert badge'],
      requiresId: true
    },
    {
      id: 'vendor',
      title: 'Vendor',
      description: 'Selling plants and gardening supplies',
      icon: FaStore,
      color: 'bg-green-500',
      features: ['Sell products', 'Manage inventory', 'Business analytics'],
      requiresId: true
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Platform administrator',
      icon: FaCrown,
      color: 'bg-red-500',
      features: ['Full access', 'User management', 'System control'],
      hidden: true // Hide from normal signup
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation messages
    const message = getValidationMessage(name, value, selectedRole);
    setFieldMessages(prev => ({ ...prev, [name]: message }));
    
    // Clear general error
    if (error) setError('');
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData, selectedRole);
    if (!validation.isValid) {
      setError('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        ...formData,
        role: selectedRole
      };
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        login(response.data.user, response.data.token);
        
        // Redirect based on user role
        switch (selectedRole) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'vendor':
            navigate('/vendor/dashboard');
            break;
          case 'expert':
            navigate('/expert/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      // Send Google user data to backend with selected role
      const googleData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: selectedRole
      };
      
      const response = await authAPI.googleSignIn(googleData);
      
      if (response.success) {
        login(response.data.user, response.data.token);
        
        // Redirect based on user role
        switch (selectedRole) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'vendor':
            navigate('/vendor/dashboard');
            break;
          case 'expert':
            navigate('/expert/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      setError(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength(passwordValidation.score);

  // Step 1: Role Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <FaLeaf className="text-4xl text-green-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">UrbanSprout</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700">Choose Your Role</h2>
            <p className="mt-2 text-gray-600">Select how you'd like to use UrbanSprout</p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.filter(role => !role.hidden).map((role) => {
              const IconComponent = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-200 p-6"
                >
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${role.color} text-white mb-4`}>
                      <IconComponent className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.title}</h3>
                    <p className="text-gray-600 mb-4">{role.description}</p>
                    
                    <div className="space-y-2">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {role.requiresId && (
                      <div className="mt-4 p-2 bg-yellow-50 rounded-lg">
                        <p className="text-xs text-yellow-700">
                          Requires professional ID verification
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  const selectedRoleData = roles.find(role => role.id === selectedRole);
  const IconComponent = selectedRoleData?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <FaLeaf className="text-4xl text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">UrbanSprout</h1>
          </div>
          
          {/* Selected Role */}
          <div className="flex items-center justify-center mb-4">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${selectedRoleData?.color} text-white mr-3`}>
              <IconComponent className="text-lg" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-700">{selectedRoleData?.title} Registration</h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-green-600 hover:text-green-500"
              >
                Change role
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  fieldMessages.name && fieldMessages.name.includes('Invalid') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {fieldMessages.name && (
                <p className={`mt-1 text-sm ${fieldMessages.name.includes('Invalid') ? 'text-red-600' : 'text-gray-500'}`}>
                  {fieldMessages.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    emailValidation.exists === true ? 'border-red-300' : 
                    emailValidation.isValid === true ? 'border-green-300' : 
                    fieldMessages.email && fieldMessages.email.includes('Invalid') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                
                {/* Email validation indicator */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {emailValidation.isChecking ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  ) : emailValidation.exists === true ? (
                    <FaTimes className="h-4 w-4 text-red-500" />
                  ) : emailValidation.isValid === true ? (
                    <FaCheck className="h-4 w-4 text-green-500" />
                  ) : null}
                </div>
              </div>
              
              {/* Email validation message */}
              {emailValidation.message && (
                <p className={`mt-1 text-sm flex items-center ${
                  emailValidation.exists === true ? 'text-red-600' : 
                  emailValidation.isValid === true ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {emailValidation.exists === true && <FaTimes className="h-3 w-3 mr-1" />}
                  {emailValidation.isValid === true && <FaCheck className="h-3 w-3 mr-1" />}
                  {emailValidation.message}
                </p>
              )}
              
              {/* Field validation message */}
              {fieldMessages.email && (
                <p className={`mt-1 text-sm ${fieldMessages.email.includes('Invalid') ? 'text-red-600' : 'text-gray-500'}`}>
                  {fieldMessages.email}
                </p>
              )}
            </div>

            {/* Professional ID for Expert/Vendor */}
            {(selectedRole === 'expert' || selectedRole === 'vendor') && (
              <div>
                <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedRole === 'expert' ? 'Expert ID' : 'Vendor ID'}
                </label>
                <input
                  id="professionalId"
                  name="professionalId"
                  type="text"
                  value={formData.professionalId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    fieldMessages.professionalId && fieldMessages.professionalId.includes('Invalid') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={`Enter your ${selectedRole} ID`}
                />
                {fieldMessages.professionalId && (
                  <p className={`mt-1 text-sm ${fieldMessages.professionalId.includes('Invalid') ? 'text-red-600' : 'text-gray-500'}`}>
                    {fieldMessages.professionalId}
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                      style={{ width: `${(passwordValidation.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center ${passwordValidation.validations.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.validations.minLength ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                      8+ characters
                    </div>
                    <div className={`flex items-center ${passwordValidation.validations.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.validations.hasUppercase ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                      Uppercase
                    </div>
                    <div className={`flex items-center ${passwordValidation.validations.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.validations.hasNumber ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                      Number
                    </div>
                    <div className={`flex items-center ${passwordValidation.validations.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.validations.hasSpecialChar ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                      Special char
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !passwordValidation.isValid || emailValidation.exists === true || emailValidation.isChecking}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              `Create ${selectedRoleData?.title} Account`
            )}
          </button>


          {/* Sign in link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;