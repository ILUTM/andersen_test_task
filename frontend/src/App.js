import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthModalContainer from './components/auth/AuthModalContainer';
import HomePage from './pages/HomePage/HomePage';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage';
import MyTasksPage from './pages/MyTasksPage/MyTasksPage';
import UserTasksPage from './pages/UserTasksPage/UserTaskPage';
import Header from './components/header/header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <AuthModalContainer />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
            <Route path="/user/:username" element={<UserTasksPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;