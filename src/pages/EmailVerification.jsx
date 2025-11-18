import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, Clock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function EmailVerification() {
  const { user, verifyEmail, sendOtp } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [collegeEmail, setCollegeEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState('');

  // Simple timer for OTP resend
  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate college email domain
    if (!collegeEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Call the Firebase API to send OTP
      const result = await sendOtp(collegeEmail);
      setLoading(false);
      
      if (result.ok) {
        setMessage('OTP sent successfully! Check your email.');
        setStep('otp');
        startTimer();
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      // Call the Firebase API to verify email
      const result = await verifyEmail(collegeEmail, otp);
      setLoading(false);
      
      if (result.ok) {
        setMessage('Email verified successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {user?.emailVerified ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Mail className="w-8 h-8 text-indigo-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your College Email
            </h1>
            <p className="text-gray-600">
              Complete verification to unlock all features and connect with your institute community.
            </p>
          </div>

          {/* Success State */}
          {user?.emailVerified ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Verified!</h3>
              <p className="text-gray-600 mb-4">
                Your college email has been verified. You now have full access to PeerIQ.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Continue to Home
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Email Entry */}
              {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label htmlFor="collegeEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      College Email Address
                    </label>
                    <input
                      id="collegeEmail"
                      type="email"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                      placeholder="your.name@college.edu"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use your official college email address (e.g., yourname@university.edu)
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-600 text-sm">{message}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-indigo-800 text-sm">
                      We've sent a 4-digit OTP to <span className="font-semibold">{collegeEmail}</span>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength="6"
                      placeholder="000000"
                      className="w-full px-4 py-3 text-center text-2xl letter-spacing tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      6-digit code
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-600 text-sm">{message}</p>
                    </div>
                  )}

                  {timer > 0 ? (
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Resend OTP in {timer}s
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                      }}
                      className="w-full text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                    >
                      Change Email
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}

              {/* Benefits */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">After Verification:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Access all platform features
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Connect with verified peers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Share resources safely
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Join study groups
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
