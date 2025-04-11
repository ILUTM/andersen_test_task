import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateTaskModal from '../tasks/CreateTaskModal';
import { apiFetch } from '../../api/fetch';
import API from '../../api/endpoints';
import '../../styles/Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const navigateToMyTasks = () => {
    navigate('/my-tasks');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Task Manager</h1>
        <button 
          onClick={navigateToMyTasks} 
          className="my-tasks-button"
        >
          My Tasks
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              // Update URL or trigger task refresh with new filter
              const currentPath = window.location.pathname;
              navigate(`${currentPath}?status=${e.target.value}`);
            }}
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