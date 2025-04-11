import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreateTaskModal from '../tasks/CreateTaskModal';
import { apiFetch } from '../../api/fetch';
import API from '../../api/endpoints';
import '../../styles/Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the My Tasks page
  const isMyTasksPage = location.pathname === '/my-tasks';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`); 
      setSearchQuery('');
    }
  };

  const handleCreateTask = () => {
    setIsModalOpen(true);
  };

  const handleTaskCreation = async (taskData) => {
    try {
      await apiFetch(API.TASKS.BASE, {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
      window.location.reload();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTasksNavigation = () => {
    if (isMyTasksPage) {
      navigate('/');
    } else {
      navigate('/my-tasks');
    }
  };

  const handleStatusFilter = (e) => {
    const status = e.target.value;
    const searchParams = new URLSearchParams(location.search);
    
    // Reset page to 1 when status changes
    searchParams.delete('page');
    
    if (status) {
      searchParams.set('status', status);
    } else {
      searchParams.delete('status');
    }
    
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  // Get current status filter from URL
  const currentStatus = new URLSearchParams(location.search).get('status') || '';

  if (!isAuthenticated) return null;

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 
          className="app-title" 
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          Task Manager
        </h1>
        <button 
          onClick={handleTasksNavigation} 
          className="tasks-toggle-button"
        >
          {isMyTasksPage ? 'All Tasks' : 'My Tasks'}
        </button>
      </div>
      
      <div className="header-center">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="search-icon">🔍</i>
          </button>
        </form>
        
        <div className="task-controls">
          <select
            value={currentStatus}
            onChange={handleStatusFilter}
            className="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
      
      <div className="header-right">
        <button onClick={handleCreateTask} className="create-task-button">
          + Create Task
        </button>
        <div className="user-info">
          <span className="username">{user?.username}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleTaskCreation}
      />
    </header>
  );
};

export default Header;