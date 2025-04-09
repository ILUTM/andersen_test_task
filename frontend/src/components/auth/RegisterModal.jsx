import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterModal = ({ switchToLogin }) => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await register(userData);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="auth-modal">
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
            minLength={4}
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={userData.first_name}
            onChange={handleChange}
            required
            autoComplete="given-name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={userData.last_name}
            onChange={handleChange}
            autoComplete="family-name"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <button 
          type="button" 
          className="switch-button"
          onClick={switchToLogin}
          disabled={isLoading}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;