import { useState } from 'react';
import { AlertIcon, PlusIcon, TypeIcon } from './icons.jsx';

function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [touched, setTouched] = useState(false);

  const titleError = title.trim() ? '' : 'Title cannot be empty or whitespace only.';
  const showTitleError = touched && Boolean(titleError);

  function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    if (titleError) {
      return;
    }
    onAdd(title.trim(), priority);
    setTitle('');
    setTouched(false);
  }

  return (
    <div className="panel">
      <h2 className="panel__heading">
        <PlusIcon /> Add a task
      </h2>
      <form onSubmit={handleSubmit} className="task-form" noValidate>
        <div className={`input-group${showTitleError ? ' input-group--invalid' : ''}`}>
          <span className="input-group__icon">
            <TypeIcon />
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="What do you need to do?"
            aria-label="New task title"
            aria-invalid={showTitleError}
            aria-describedby={showTitleError ? 'task-title-error' : undefined}
          />
        </div>
        <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="btn btn--primary">
          <PlusIcon /> Add
        </button>
        {showTitleError && (
          <p role="alert" className="field-error" id="task-title-error">
            <AlertIcon />
            {titleError}
          </p>
        )}
      </form>
    </div>
  );
}

export default TaskForm;
