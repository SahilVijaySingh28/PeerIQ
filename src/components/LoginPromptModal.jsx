import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPromptModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleSignup = () => {
    onClose();
    navigate('/signup');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-50'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 transform transition-all duration-200 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Login Required</h2>
              <p className="text-sm text-gray-500 mt-1">Access restricted content</p>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              This feature is only available to verified members. Please log in or verify your email to continue.
            </p>
            <p className="text-sm text-gray-600">
              Once you're verified, you'll have access to:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
              <li>• Connect with peers in your institute</li>
              <li>• Access and share study resources</li>
              <li>• Join study groups and events</li>
              <li>• Participate in video meetings</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Login to Your Account
            </button>
            <button
              onClick={handleSignup}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg transition-colors"
            >
              Create New Account
            </button>
            <button
              onClick={handleClose}
              className="w-full text-gray-600 hover:text-gray-900 font-semibold py-2 transition-colors"
            >
              Continue Browsing
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Only logged in and verified users can access this feature
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
