import type { Task, UpdateTaskPayload } from "../types/task";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, data: UpdateTaskPayload) => void;
}

export function TaskList({ tasks, loading, error, onToggle, onDelete, onEdit }: TaskListProps) {
  if (loading) {
    return (
      <div className="task-list-status" data-testid="loading">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-list-status error-state" data-testid="error">
        <div className="error-icon">⚠️</div>
        <p className="error-message">Erreur : {error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-status empty-state" data-testid="empty">
        <div className="empty-icon">📋</div>
        <h3>Aucune tâche</h3>
        <p>Commencez par ajouter votre première tâche !</p>
      </div>
    );
  }

  return (
    <div className="task-list" data-testid="task-list">
      <div className="task-count">
        <span>
          {tasks.length} tâche{tasks.length > 1 ? "s" : ""}
        </span>
        <span className="task-count-completed">
          {tasks.filter((t) => t.completed).length} terminée
          {tasks.filter((t) => t.completed).length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="task-items">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="task-item-wrapper"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <TaskItem task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
          </div>
        ))}
      </div>
    </div>
  );
}
