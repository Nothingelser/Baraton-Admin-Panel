import React, { useState } from 'react';
import { AlertCircle, Calendar, CheckCircle, Eye, EyeOff, RefreshCw, User, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';

function LecturerSignupPage({ setShowSignup, setCurrentUser }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    staffId: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const validateStep1 = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.email.includes('@')) errors.push('Valid email is required');
    if (!formData.staffId.trim()) errors.push('Staff ID is required');

    if (errors.length > 0) {
      setError(errors.join('. '));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const errors = [];
    if (formData.password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(formData.password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(formData.password)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(formData.password)) errors.push('Password must contain at least one number');
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');

    if (errors.length > 0) {
      setError(errors.join('. '));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateStep2()) {
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            staff_id: formData.staffId,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          [
            {
              id: authData.user.id,
              full_name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              role: 'lecturer',
              staff_id: formData.staffId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          {
            onConflict: 'id',
            ignoreDuplicates: false,
          }
        );

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError('Account created but profile setup failed. Please contact administrator.');
        setLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(async () => {
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (loginData.user) {
          const user = {
            id: loginData.user.id,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            role: 'lecturer',
            staffId: formData.staffId,
            avatar: formData.firstName[0]?.toUpperCase() || 'L',
          };

          setCurrentUser(user);
          localStorage.setItem('adminUser', JSON.stringify(user));
          setShowSignup(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 md:p-12">
            <div className="mb-8">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">Baraton University</h1>
                  <p className="text-blue-200 text-sm">Examination Management System</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Lecturer Registration</h2>
              <p className="text-blue-200 mb-6">
                Join our examination management system to efficiently schedule and manage your courses.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                  <span>Manage your course schedules</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                  <span>Track student enrollment</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                  <span>Real-time notifications</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                  <span>Secure access to all features</span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-blue-500/30">
              <p className="text-sm text-blue-200">
                Already have an account?{' '}
                <button onClick={() => setShowSignup(false)} className="text-white font-semibold hover:underline">
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          <div className="md:w-3/5 p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lecturer Account Setup</h2>
                <p className="text-gray-600">Step {step} of 2</p>
              </div>
              <button onClick={() => setShowSignup(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-blue-600">{step === 1 ? '50%' : '100%'}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-600">Personal Information</span>
                <span className="text-xs text-gray-600">Account Setup</span>
              </div>
            </div>

            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Registration Successful!</h3>
                <p className="text-gray-600 mb-6">
                  Your lecturer account has been created successfully. You will be redirected to the dashboard shortly.
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        University Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john.doe@baraton.ac.ke"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Must be a valid university email address</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Staff ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.staffId}
                        onChange={(e) => setFormData({ ...formData, staffId: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="STAFF-12345"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Your official university staff identification number</p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition font-medium"
                      >
                        Continue to Account Setup
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Account for: {formData.firstName} {formData.lastName}
                          </p>
                          <p className="text-xs text-blue-700">
                            {formData.email} • Staff ID: {formData.staffId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Create Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                          placeholder="Create a strong password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600">Password must contain:</p>
                        <div className="grid grid-cols-2 gap-1">
                          <div className={`flex items-center text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            At least 8 characters
                          </div>
                          <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            One uppercase letter
                          </div>
                          <div className={`flex items-center text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            One lowercase letter
                          </div>
                          <div className={`flex items-center text-xs ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            One number
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                      <div className="mt-2">
                        <div
                          className={`flex items-center text-xs ${
                            formData.password && formData.password === formData.confirmPassword ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              formData.password && formData.password === formData.confirmPassword ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          ></div>
                          Passwords match
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                        I agree to the{' '}
                        <button type="button" className="text-blue-600 hover:text-blue-800">
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button type="button" className="text-blue-600 hover:text-blue-800">
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex space-x-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                            Creating Account...
                          </>
                        ) : (
                          'Complete Registration'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Need administrative access?{' '}
                <button type="button" onClick={() => setShowSignup(false)} className="text-blue-600 hover:text-blue-800 font-medium">
                  Contact system administrator
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerSignupPage;

