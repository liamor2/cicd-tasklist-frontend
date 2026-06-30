import { useState } from "react";
import type { CreateTaskPayload } from "../types/task";

interface TaskFormProps {
  onSubmit: (data: CreateTaskPayload) => void;
  initialValues?: { title: string; description?: string };
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function TaskForm({ onSubmit, initialValues, onCancel, mode = "create" }: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Le titre est requis");
      return;
    }
    setValidationError("");
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    if (mode === "create") {
      setTitle("");
      setDescription("");
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} data-testid="task-form">
      <div className="form-header">
        <h2>{mode === "edit" ? "Modifier la tâche" : "Nouvelle tâche"}</h2>
      </div>
      <div className="form-group">
        <input
          type="text"
          className={`form-input ${validationError ? "input-error" : ""}`}
          placeholder="Titre de la tâche *"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (validationError) setValidationError("");
          }}
          aria-label="Titre"
        />
        {validationError && (
          <span className="validation-error" role="alert">
            {validationError}
          </span>
        )}
      </div>
      <div className="form-group">
        <textarea
          className="form-input form-textarea"
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          aria-label="Description"
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {mode === "edit" ? "Modifier" : "Ajouter"}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
