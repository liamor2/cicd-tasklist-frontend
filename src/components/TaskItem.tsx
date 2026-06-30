import { useState } from "react";
import type { Task, UpdateTaskPayload } from "../types/task";

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, data: UpdateTaskPayload) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onEdit(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const createdDate = new Date(task.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`task-item ${task.completed ? "task-completed" : ""}`} data-testid="task-item">
      {editing ? (
        <div className="task-edit-form">
          <input
            type="text"
            className="edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Titre de la tâche"
            aria-label="Modifier le titre"
          />
          <textarea
            className="edit-textarea"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optionnel)"
            aria-label="Modifier la description"
            rows={2}
          />
          <div className="edit-actions">
            <button className="btn btn-save" onClick={handleSave} type="button">
              Enregistrer
            </button>
            <button className="btn btn-cancel" onClick={handleCancel} type="button">
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-checkbox-wrapper">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="task-checkbox"
              aria-label={`Marquer "${task.title}" comme ${task.completed ? "non terminée" : "terminée"}`}
            />
            <span className="checkbox-custom" />
          </div>
          <div className="task-content">
            <h3 className="task-title">{task.title}</h3>
            {task.description && <p className="task-description">{task.description}</p>}
            <span className="task-date">{createdDate}</span>
          </div>
          <div className="task-actions">
            <button
              className="btn btn-icon btn-edit"
              onClick={() => setEditing(true)}
              aria-label="Modifier"
              title="Modifier"
              type="button"
            >
              ✏️
            </button>
            <button
              className="btn btn-icon btn-delete"
              onClick={handleDelete}
              aria-label="Supprimer"
              title="Supprimer"
              type="button"
            >
              {confirmDelete ? "⚠️" : "🗑️"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
