import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskEditForm from './TaskEditForm';
import '../../styles/TaskCard.css';

const TaskCard = ({ task, onTaskUpdated }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleEditClick = () => {
    if (task.user === user?.username) {
      setIsEditing(true);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
  };

  if (isEditing) {
    return (
      <TaskEditForm
        task={task}
        initialFormData={{
          title: task.title,
          description: task.description,
          status: task.status
        }}
        onCancel={() => setIsEditing(false)}
        onTaskUpdated={(updatedTask) => {
          setIsEditing(false);
          onTaskUpdated(updatedTask);
        }}
      />
    );
  }

  return (
    <div className={`task-card ${task.status.toLowerCase()}`}>
      {task.user === user?.username ? (
        <div className="owner-corner-badge">Owner</div>
      ) : (
        <div 
          className="creator-link" 
          onClick={() => handleUserClick(task.user)}
          style={{ cursor: 'pointer' }}
        >
          {task.user}
        </div>
      )}
      <h3 className="task-title">
        {task.title}
      </h3>
      <p className="description">{task.description || 'No description'}</p>
      <div className="task-meta">
        <span className={`status ${task.status.toLowerCase()}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className="date">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </span>
        {task.user === user?.username && (
          <div className="task-actions">
            <button onClick={handleEditClick} className="edit-button">
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;