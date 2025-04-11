import TaskCard from './TaskCard';
import TaskControls from './TaskControls';
import PaginationControls from './PaginationControls';
import '../../styles/TasksList.css';

const TasksList = ({ 
  title,
  tasks,
  statusFilter,
  setStatusFilter,
  pagination,
  onPageChange
}) => {
  return (
    <div className="tasks-page">
      <h1>{title}</h1>
      
      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <>
          <div className="task-list">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          
          {pagination.total_pages > 1 && (
            <PaginationControls 
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TasksList;