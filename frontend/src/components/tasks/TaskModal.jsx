import { useState, useEffect } from 'react';
import { apiFetch } from '../../api/fetch';
import API from '../../api/endpoints';
import '../../styles/TaskModal.css';

const TaskModal = ({ task, isOwner, onClose, onTaskUpdated, onTaskDeleted }) => {
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    status: task.status
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedTask = await apiFetch(
        API.TASKS.BY_ID(task.id), 
        {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus })
        }
      );
      onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiFetch(
          API.TASKS.BY_ID(task.id), 
          { method: 'DELETE' }
        );
        onTaskDeleted(task.id);
        onClose();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = await apiFetch(
        API.TASKS.BY_ID(task.id), 
        {
          method: 'PATCH',
          body: JSON.stringify(editData)
        }
      );
      onTaskUpdated(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={e => e.stopPropagation()}>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <h2>Edit Task</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={editData.status}
                onChange={handleChange}
              >
                {Object.entries(task.STATUS_CHOICES || {
                  NEW: 'New',
                  IN_PROGRESS: 'In Progress',
                  COMPLETED: 'Completed'
                }).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn-save">Save</button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2>{task.title}</h2>
            <div className={`status-badge ${task.status}`}>
              {task.status}
            </div>
            <p className="task-description">
              {task.description || 'No description provided'}
            </p>
            <div className="task-meta">
              <span>Created by: {task.user}</span>
              <span>Created on: {new Date(task.created_at).toLocaleDateString()}</span>
            </div>
            {isOwner && (
              <div className="modal-actions">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-edit"
                >
                  Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="btn-delete"
                >
                  Delete
                </button>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select"
                >
                  {Object.entries(task.STATUS_CHOICES || {
                    NEW: 'New',
                    IN_PROGRESS: 'In Progress',
                    COMPLETED: 'Completed'
                  }).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskModal;