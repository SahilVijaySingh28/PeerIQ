import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import LoginPromptModal from '../components/LoginPromptModal';

/**
 * ProtectedRoute component
 * - Requires user to be logged in
 * - If verified email required, shows modal prompting to verify
 * - Shows modal on unauthorized access attempts
 */
function ProtectedRoute({ children, requireVerification = true }) {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  // Show modal immediately if user is not authenticated or not verified (when required)
  useEffect(() => {
    if (!user) {
      setShowModal(true);
    } else if (requireVerification && !user.emailVerified) {
      setShowModal(true);
    }
  }, [user, requireVerification]);

  // If user is authenticated and verified (if required), render children
  if (user && (!requireVerification || user.emailVerified)) {
    return (
      <>
        {children}
        <LoginPromptModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // If not authenticated or not verified, show modal
  return <LoginPromptModal isOpen={showModal} onClose={() => setShowModal(false)} />;
}

export default ProtectedRoute;
