import TaskItem from './TaskItem.jsx';
import { ClipboardIllustration } from './icons.jsx';

function TaskList({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  emptyMessage = 'No tasks yet. Add one above to get started.',
}) {
  if (tasks.length === 0) {
    return (
      <div className="task-list__empty">
        <ClipboardIllustration />
        <p className="task-list__empty-heading">Nothing to see here</p>
        <p className="task-list__empty-sub">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
        />
      ))}
    </ul>
  );
}

export default TaskList;
