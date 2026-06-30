import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { useTasks } from "./hooks/useTasks";
import type { CreateTaskPayload } from "./types/task";

function App() {
  const { tasks, loading, error, addTask, editTask, removeTask, toggleComplete } = useTasks();

  const handleAddTask = async (data: CreateTaskPayload) => {
    try {
      await addTask(data);
    } catch {
      // Error handled by useTasks
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      <div className="app-bg-glow" />
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">✦</span>
            <h1>Mes Tâches</h1>
          </div>
          {tasks.length > 0 && (
            <div className="header-stats">
              <div className="stat">
                <span className="stat-value">{tasks.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value stat-success">{completedCount}</span>
                <span className="stat-label">Terminées</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value stat-pending">{tasks.length - completedCount}</span>
                <span className="stat-label">En cours</span>
              </div>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">
        <div className="container">
          <TaskForm onSubmit={handleAddTask} />
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onToggle={toggleComplete}
            onDelete={removeTask}
            onEdit={editTask}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
