import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../api/endpoints';
import TasksPageTemplate from '../../components/tasks/TasksPageTemplate';

const MyTasksPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const statusFilter = searchParams.get('status') || '';

  const buildEndpoint = useCallback((page = 1) => {
    const url = new URL(API.TASKS.MY_TASKS, window.location.origin);
    url.searchParams.append('page', page);
    url.searchParams.append('page_size', 10);
    if (statusFilter) {
      url.searchParams.append('status', statusFilter);
    }
    return url.toString();
  }, [statusFilter]);

  return (
    <TasksPageTemplate
      title="My Tasks"
      buildEndpoint={buildEndpoint}
    />
  );
};

export default MyTasksPage;