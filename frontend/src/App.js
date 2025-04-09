import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModalContainer from './components/auth/AuthModalContainer';
import HomePage from './pages/HomePage/HomePage';
import Header from './components/header/header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Header /> */}
        <AuthModalContainer />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;