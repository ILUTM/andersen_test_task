import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../api/endpoints';
import TasksPageTemplate from '../../components/tasks/TasksPageTemplate';

const SearchResultsPage = () => {
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q');
  const statusFilter = new URLSearchParams(location.search).get('status') || '';

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

  const redirectCondition = useCallback(() => !searchQuery, [searchQuery]);

  return (
    <TasksPageTemplate
      title={`Search Results for "${searchQuery}"`}
      buildEndpoint={buildEndpoint}
      redirectCondition={redirectCondition}
    />
  );
};

export default SearchResultsPage;