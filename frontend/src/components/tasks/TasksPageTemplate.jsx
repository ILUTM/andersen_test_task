import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/fetch';
import TasksList from './TasksList';

const TasksPageTemplate = ({ 
  title, 
  buildEndpoint, // Changed from buildEndpoint to endpointBuilder
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

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    page_size: 10,
    total_items: 0
  });

  // Stable fetch function that doesn't depend on endpointBuilder
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
  }, [errorMessage]); // Removed endpointBuilder from dependencies

  // Initial load
  useEffect(() => {
    if (initialLoad.current && isAuthenticated && !redirectCondition()) {
      fetchTasks(1);
      initialLoad.current = false;
    }
  }, [isAuthenticated, redirectCondition, fetchTasks]);

  // Handle URL changes (pagination, filters)
  useEffect(() => {
    if (!isAuthenticated || redirectCondition()) {
      navigate(redirectPath);
      return;
    }

    // Only fetch if search params actually changed
    if (location.search !== prevSearch.current) {
      const page = new URLSearchParams(location.search).get('page') || 1;
      fetchTasks(Number(page));
      prevSearch.current = location.search;
    }
  }, [location.search, isAuthenticated, redirectCondition, redirectPath, navigate, fetchTasks]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('page', newPage);
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  };

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
    />
  );
};

export default TasksPageTemplate;