import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/endpoints';
import TasksList from '../../components/tasks/TasksList';
import { apiFetch } from '../../api/fetch';

const SearchResultsPage = () => {
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

  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = new URLSearchParams(location.search).get('q');

  const buildEndpoint = useCallback((page = 1) => {
    const url = new URL(API.TASKS.SEARCH, window.location.origin);
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('page', page);
    url.searchParams.append('page_size', 10);
    if (statusFilter) {
      url.searchParams.append('status', statusFilter);
    }
    return url.toString();
  }, [searchQuery, statusFilter]);

  const fetchTasks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const endpoint = buildEndpoint(page);
      console.log('Fetching search results from:', endpoint);
      
      const response = await apiFetch(endpoint, {});
      
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
      setError(err.message || 'Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  }, [buildEndpoint]);

  useEffect(() => {
    if (!searchQuery) {
      navigate('/');
      return;
    }
    fetchTasks(pagination.current_page);
  }, [fetchTasks, searchQuery, navigate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchTasks(newPage);
    }
  };

  if (loading && tasks.length === 0) {
    return <div className="loading">Loading search results...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <TasksList
      title={`Search Results for "${searchQuery}"`}
      tasks={tasks}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
};

export default SearchResultsPage;