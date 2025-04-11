import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/endpoints';
import TasksList from '../../components/tasks/TasksList';
import { apiFetch } from '../../api/fetch';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    page_size: 10,
    total_items: 0
  });

  const buildEndpoint = useCallback((page = 1) => {
    const url = new URL(API.TASKS.BASE, window.location.origin);
    url.searchParams.append('page', page);
    url.searchParams.append('page_size', 10);
    if (statusFilter) {
      url.searchParams.append('status', statusFilter);
    }
    return url.toString();
  }, [statusFilter]);

  const fetchTasks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const endpoint = buildEndpoint(page);
      console.log('Fetching tasks from:', endpoint);
      
      const response = await apiFetch(endpoint, {});
      console.log('Received response:', response);
      
      if (response && response.results) {
        setTasks(response.results);
        setPagination(response.pagination || {
          current_page: page,
          total_pages: Math.ceil((response.count || response.results.length) / 10),
          page_size: 10,
          total_items: response.count || response.results.length
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [buildEndpoint]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks(pagination.current_page);
    }
  }, [isAuthenticated, fetchTasks]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchTasks(newPage);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="homepage">
        <h1>Welcome to Task Manager</h1>
        <p>Please login to view and manage your tasks</p>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <TasksList
      title="All Tasks"
      tasks={tasks}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
};

export default HomePage;