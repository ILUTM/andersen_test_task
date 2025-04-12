import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/fetch';
import TasksList from './TasksList';

const TasksPageTemplate = ({ 
  title, 
  buildEndpoint, 
  redirectCondition = () => false,
  redirectPath = '/',
  emptyMessage = null,
  loadingMessage = 'Loading tasks...',
  errorMessage = 'Failed to fetch tasks'
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initialLoad = useRef(true);
  const prevSearch = useRef(location.search);
  const prevBuildEndpoint = useRef(buildEndpoint);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    page_size: 10,
    total_items: 0
  });

  const fetchTasks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const endpoint = buildEndpoint(page);
      
      const response = await apiFetch(endpoint, {});
      
      if (response?.results) {
        setTasks(response.results);
        setPagination(response.pagination || {
          current_page: page,
          total_pages: Math.ceil((response.count || response.results.length) / 10),
          page_size: 10,
          total_items: response.count || response.results.length
        });
      }
    } catch (err) {
      setError(err.message || errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [errorMessage, buildEndpoint]); // Re-added buildEndpoint to dependencies

  // Initial load
  useEffect(() => {
    if (initialLoad.current && isAuthenticated && !redirectCondition()) {
      fetchTasks(1);
      initialLoad.current = false;
    }
  }, [isAuthenticated, redirectCondition, fetchTasks]);

  // Handle URL and endpoint changes
  useEffect(() => {
    if (!isAuthenticated || redirectCondition()) {
      navigate(redirectPath);
      return;
    }

    // Check if either search params or buildEndpoint changed
    const page = new URLSearchParams(location.search).get('page') || 1;
    
    if (location.search !== prevSearch.current || buildEndpoint !== prevBuildEndpoint.current) {
      fetchTasks(Number(page));
      prevSearch.current = location.search;
      prevBuildEndpoint.current = buildEndpoint;
    }
  }, [location.search, isAuthenticated, redirectCondition, redirectPath, navigate, fetchTasks, buildEndpoint]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('page', newPage);
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  };

  const handleTaskUpdated = useCallback((updatedTasks) => {
    setTasks(updatedTasks);
    
    if (updatedTasks.length < tasks.length) {
      const newTotalItems = pagination.total_items - 1;
      const newTotalPages = Math.ceil(newTotalItems / pagination.page_size);
      
      setPagination(prev => ({
        ...prev,
        total_items: newTotalItems,
        total_pages: newTotalPages,
        current_page: Math.min(prev.current_page, newTotalPages)
      }));
    }
  }, [tasks.length, pagination.total_items, pagination.page_size]);

  if (!isAuthenticated) {
    return emptyMessage || <div>Please login to view this content</div>;
  }

  if (loading && tasks.length === 0) {
    return <div className="loading">{loadingMessage}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <TasksList
      title={title}
      tasks={tasks}
      pagination={pagination}
      onPageChange={handlePageChange}
      onTaskUpdated={handleTaskUpdated} 
    />
  );
};

export default TasksPageTemplate;