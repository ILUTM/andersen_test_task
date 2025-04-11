import '../../styles/TaskControls.css';

const TaskControls = ({ statusFilter, setStatusFilter }) => {
  return (
    <div className="task-controls">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="status-filter"
      >
        <option value="">All Statuses</option>
        <option value="NEW">New</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>
    </div>
  );
};

export default TaskControls;