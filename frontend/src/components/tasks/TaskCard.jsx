import { useAuth } from '../../context/AuthContext';
import '../../styles/TaskCard.css';

const TaskCard = ({ task }) => {
  const { user } = useAuth();
  
  return (
    <div className={`task-card ${task.status.toLowerCase()}`}>
      <h3>{task.title}</h3>
      <p className="description">{task.description || 'No description'}</p>
      <div className="task-meta">
        <span className={`status ${task.status.toLowerCase()}`}>
          {task.status}
        </span>
        <span className="date">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </span>
        {task.user === user?.username && (
          <span className="owner">(Your task)</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;