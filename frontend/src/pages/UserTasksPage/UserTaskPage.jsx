import { useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import API from '../../api/endpoints';
import TasksPageTemplate from '../../components/tasks/TasksPageTemplate';

const UserTasksPage = () => {
  const { username } = useParams();
  const location = useLocation();
  const statusFilter = new URLSearchParams(location.search).get('status') || '';

  const buildEndpoint = useCallback((page = 1) => {
    const url = new URL(API.TASKS.BASE, window.location.origin);
    url.searchParams.append('username', username);
    url.searchParams.append('page', page);
    url.searchParams.append('page_size', 10);
    if (statusFilter) {
      url.searchParams.append('status', statusFilter);
    }
    return url.toString();
  }, [username, statusFilter]);

  const redirectCondition = useCallback(() => !username, [username]);

  return (
    <TasksPageTemplate
      title={`${username}'s Tasks`}
      buildEndpoint={buildEndpoint}
      redirectCondition={redirectCondition}
    />
  );
};

export default UserTasksPage;