import { useState } from 'react';
import {
  AlertIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
  EqualIcon,
  FlameIcon,
  TrashIcon,
  TypeIcon,
} from './icons.jsx';

const PRIORITY_ICON = {
  low: ArrowDownIcon,
  medium: EqualIcon,
  high: FlameIcon,
};

const PRIORITY_LABEL = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function TaskItem({ task, onEdit, onDelete, onStatusChange, onPriorityChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [touched, setTouched] = useState(false);

  const isCompleted = task.status === 'completed';
  const PriorityIcon = PRIORITY_ICON[task.priority] || EqualIcon;
  const titleError = title.trim() ? '' : 'Title cannot be empty or whitespace only.';
  const showTitleError = touched && Boolean(titleError);
  const titleErrorId = `task-${task.id}-edit-title-error`;

  function startEdit() {
    setTitle(task.title);
    setTouched(false);
    setIsEditing(true);
  }

  function cancelEdit() {
    setTitle(task.title);
    setTouched(false);
    setIsEditing(false);
  }

  function saveEdit() {
    setTouched(true);
    if (titleError) {
      return;
    }
    onEdit(task.id, title.trim());
    setIsEditing(false);
    setTouched(false);
  }

  function toggleStatus() {
    onStatusChange(task.id, isCompleted ? 'pending' : 'completed');
  }

  return (
    <li
      className={`task-item task-item--${task.priority} ${
        isCompleted ? 'task-item--completed' : 'task-item--pending'
      }`}
    >
      <div className="task-item__row task-item__row--top">
        <label className="task-item__status">
          <input
            type="checkbox"
            className="task-item__checkbox"
            checked={isCompleted}
            onChange={toggleStatus}
            aria-label={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
          />
        </label>

        {isEditing ? (
          <span className="task-item__edit">
            <div className={`input-group${showTitleError ? ' input-group--invalid' : ''}`}>
              <span className="input-group__icon">
                <TypeIcon />
              </span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={() => setTouched(true)}
                aria-label="Edit task title"
                aria-invalid={showTitleError}
                aria-describedby={showTitleError ? titleErrorId : undefined}
              />
            </div>
            <button type="button" onClick={saveEdit} className="btn btn--primary btn--sm">
              <CheckCircleIcon />
              Save
            </button>
            <button type="button" onClick={cancelEdit} className="btn btn--secondary btn--sm">
              Cancel
            </button>
            {showTitleError && (
              <span role="alert" className="field-error" id={titleErrorId}>
                <AlertIcon />
                {titleError}
              </span>
            )}
          </span>
        ) : (
          <span className="task-item__title">{task.title}</span>
        )}

        {!isEditing && (
          <span className="task-item__actions">
            <button type="button" onClick={startEdit} className="btn btn--secondary btn--sm">
              <EditIcon />
              Edit
            </button>
            <button type="button" onClick={() => onDelete(task.id)} className="btn btn--danger btn--sm">
              <TrashIcon />
              Delete
            </button>
          </span>
        )}
      </div>

      <div className="task-item__row task-item__row--meta">
        <span className="task-item__badge badge">
          {isCompleted ? <CheckCircleIcon /> : <ClockIcon />}
          {isCompleted ? 'Completed' : 'Pending'}
        </span>

        <span className={`priority-control priority-control--${task.priority}`}>
          <span className={`task-item__priority-badge task-item__priority-badge--${task.priority}`}>
            <PriorityIcon />
            {PRIORITY_LABEL[task.priority] || 'Medium'}
          </span>
          <span className="priority-control__chevron" aria-hidden="true">
            <ChevronDownIcon />
          </span>
          <select
            className="task-item__priority-select"
            value={task.priority}
            onChange={(event) => onPriorityChange(task.id, event.target.value)}
            aria-label={`Change priority of "${task.title}"`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </span>
      </div>
    </li>
  );
}

export default TaskItem;
