import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/fetch';
import API from '../../api/endpoints';
import TaskCard from '../../components/tasks/TaskCard';
import '../../styles/HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const params = statusFilter ? { status: statusFilter } : {};
        const data = await apiFetch(API.TASKS.BASE, { params });
        setTasks(data);
      } catch (err) {
        setError('Failed to fetch tasks');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, statusFilter]);

  if (!isAuthenticated) {
    return (
      <div className="homepage">
        <h1>Welcome to Task Manager</h1>
        <p>Please login to view and manage your tasks</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="homepage">
      <h1>Your Tasks</h1>
      
      <div className="task-controls">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <p>No tasks found. Create your first task!</p>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;