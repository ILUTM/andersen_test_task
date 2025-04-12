import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/fetch';
import API from '../../api/endpoints';
import '../../styles/TaskCard.css';

const TaskCard = ({ task, onTaskUpdated }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    status: task.status
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = () => {
    // Double-check if user is the creator before allowing edit
    if (task.user === user?.username) {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare updates
      const updates = {};
      if (formData.title !== task.title) updates.title = formData.title;
      if (formData.description !== task.description) updates.description = formData.description;
      if (formData.status !== task.status) updates.status = formData.status;

      // Send updates
      if (Object.keys(updates).length > 0) {
        await apiFetch(API.TASKS.BY_ID(task.id), {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
  
        const updatedTask = { ...task, ...updates };
        onTaskUpdated && onTaskUpdated(updatedTask); // This triggers the update
      }

      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiFetch(API.TASKS.BY_ID(task.id), {  // <-- Fixed this line
          method: 'DELETE'
        });

        // Notify parent about deletion
        onTaskUpdated && onTaskUpdated(null); 
      } catch (err) {
        setError(err.message || 'Failed to delete task');
      }
    }
  };

  if (isEditing) {
    return (
      <div className={`task-card editing ${task.status}`}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="task-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleDelete} 
              disabled={isSubmitting}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`task-card ${task.status}`}>
      <h3>{task.title}</h3>
      <p className="description">{task.description || 'No description'}</p>
      <div className="task-meta">
        <span className={`status ${task.status}`}>
          {task.status}
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