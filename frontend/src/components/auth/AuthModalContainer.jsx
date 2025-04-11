import { useAuth } from '../../context/AuthContext';
import ModalOverlay from './ModalOverlay';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const AuthModalContainer = () => {
  const { 
    authModalType,
    isAuthenticated,
    setAuthModalType 
  } = useAuth();

  // Don't show modal if authenticated or no modal type
  if (isAuthenticated || !authModalType) return null;

  return (
    <ModalOverlay>
      {authModalType === 'login' ? (
        <LoginModal switchToRegister={() => setAuthModalType('register')} />
      ) : (
        <RegisterModal switchToLogin={() => setAuthModalType('login')} />
      )}
    </ModalOverlay>
  );
};

export default AuthModalContainer;