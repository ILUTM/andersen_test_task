import TaskCard from './TaskCard';
import PaginationControls from './PaginationControls';
import '../../styles/TasksList.css';

const TasksList = ({ 
  title,
  tasks,
  statusFilter,
  setStatusFilter,
  pagination,
  onPageChange,
  onTaskUpdated 
}) => {
  const handleTaskUpdated = (updateInfo) => {
    if (updateInfo?.deleted) {
      onTaskUpdated(tasks.filter(task => task.id !== updateInfo.id));
    } else if (updateInfo) {
      onTaskUpdated(tasks.map(task => 
        task.id === updateInfo.id ? updateInfo : task
      ));
    }
  };

  return (
    <div className="tasks-page">
      <h1>{title}</h1>
      
      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <>
          <div className="task-list">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                onTaskUpdated={handleTaskUpdated} // Pass to TaskCard
              />
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