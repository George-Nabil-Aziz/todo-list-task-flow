import { useEffect, useState } from 'react';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import { fetchTasks, createTask, updateTask, deleteTask, setTaskStatus, setTaskPriority } from './api/tasksApi.js';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './hooks/useTheme.js';
import ThemeToggle from './components/ThemeToggle.jsx';
import { AlertIcon, ClipboardIcon, FilterIcon, LogOutIcon, SortIcon } from './components/icons.jsx';

const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

function TaskDashboard() {
  const { logout, username } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchTasks()
      .then((data) => setTasks(data))
      .catch((err) => {
        setError(err.message);
        if (err.status === 401) {
          logout();
        }
      })
      .finally(() => setLoading(false));
  }, [logout]);

  async function handleAdd(title, priority) {
    try {
      const task = await createTask(title, priority);
      setTasks((current) => [...current, task]);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.status === 401) {
        logout();
      }
    }
  }

  async function handleEdit(id, title) {
    try {
      const updated = await updateTask(id, title);
      setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.status === 401) {
        logout();
      }
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.status === 401) {
        logout();
      }
    }
  }

  async function handleStatusChange(id, status) {
    try {
      const updated = await setTaskStatus(id, status);
      setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.status === 401) {
        logout();
      }
    }
  }

  async function handlePriorityChange(id, priority) {
    try {
      const updated = await setTaskPriority(id, priority);
      setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.status === 401) {
        logout();
      }
    }
  }

  const visibleTasks = tasks
    .filter((task) => filterPriority === 'all' || task.priority === filterPriority)
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'high-first') return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (sortOrder === 'low-first') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return 0;
    });

  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;
  const displayName = username || 'you';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || '?';

  return (
    <main className="app">
      <header className="app__header">
        <div className="app__header-top">
          <div className="app__title">
            <span className="app__title-icon">
              <ClipboardIcon />
            </span>
            <div>
              <h1>ToDo Tasks</h1>
              <div className="app__identity">
                <span className="app__avatar" aria-hidden="true">
                  {avatarInitial}
                </span>
                <p className="app__welcome">Logged in as {displayName}</p>
              </div>
            </div>
          </div>
          <div className="app__header-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle--on-brand" />
            <button onClick={logout} className="btn btn--ghost">
              <LogOutIcon />
              Log Out
            </button>
          </div>
        </div>

        <div className="app__stats">
          <div className="stat-card">
            <div className="stat-card__value">{tasks.length}</div>
            <div className="stat-card__label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{pendingCount}</div>
            <div className="stat-card__label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{completedCount}</div>
            <div className="stat-card__label">Completed</div>
          </div>
        </div>
      </header>

      <TaskForm onAdd={handleAdd} />

      <div className="toolbar">
        <label className="field">
          <span>
            <FilterIcon /> Filter by priority
          </span>
          <select
            value={filterPriority}
            onChange={(event) => setFilterPriority(event.target.value)}
            aria-label="Filter by priority"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="field">
          <span>
            <SortIcon /> Sort by priority
          </span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort by priority">
            <option value="none">None</option>
            <option value="high-first">High to Low</option>
            <option value="low-first">Low to High</option>
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="alert">
          <AlertIcon />
          {error}
        </p>
      )}

      {loading ? (
        <div className="skeleton-list" aria-hidden="true">
          {[0, 1, 2].map((key) => (
            <div className="skeleton-card" key={key}>
              <div className="skeleton-bar skeleton-bar--circle" />
              <div className="skeleton-bar skeleton-bar--title" />
              <div className="skeleton-bar skeleton-bar--badge" />
            </div>
          ))}
        </div>
      ) : (
        <TaskList
          tasks={visibleTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          emptyMessage={
            tasks.length === 0
              ? 'No tasks yet. Add one above to get started.'
              : 'No tasks match the selected priority filter.'
          }
        />
      )}
    </main>
  );
}

function App() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState('login');

  if (!isAuthenticated) {
    return view === 'login' ? (
      <LoginPage onSwitchToRegister={() => setView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setView('login')} />
    );
  }

  return <TaskDashboard />;
}

export default App;
