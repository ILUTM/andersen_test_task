import { useState } from 'react';
import { apiFetch } from '../../api/fetch';
import API from '../../api/endpoints';
import '../../styles/TaskCard.css';

const TaskEditForm = ({ 
  task, 
  initialFormData, 
  onCancel, 
  onTaskUpdated 
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updates = {};
      if (formData.title !== task.title) updates.title = formData.title;
      if (formData.description !== task.description) updates.description = formData.description;
      if (formData.status !== task.status) updates.status = formData.status;

      if (Object.keys(updates).length > 0) {
        await apiFetch(API.TASKS.BY_ID(task.id), {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
        onTaskUpdated({ ...task, ...updates });
      }
      onCancel();
    } catch (err) {
      setError(err.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiFetch(API.TASKS.BY_ID(task.id), { method: 'DELETE' });
        onTaskUpdated(null);
      } catch (err) {
        setError(err.message || 'Failed to delete task');
      }
    }
  };

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
            {task.status === 'NEW' && (
              <option value="NEW">New</option>
            )}
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="task-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting}
          >
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
};

export default TaskEditForm;