import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskList } from "../components/TaskList";
import type { Task } from "../types/task";

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Première tâche",
    description: "Description 1",
    completed: false,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Deuxième tâche",
    description: null,
    completed: true,
    createdAt: "2026-01-16T10:00:00Z",
    updatedAt: "2026-01-16T10:00:00Z",
  },
];

describe("TaskList", () => {
  it("shows loading state", () => {
    render(
      <TaskList
        tasks={[]}
        loading={true}
        error={null}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.getByText("Chargement des tâches...")).toBeInTheDocument();
  });

  it("renders list of tasks", () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        error={null}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByTestId("task-list")).toBeInTheDocument();
    expect(screen.getByText("Première tâche")).toBeInTheDocument();
    expect(screen.getByText("Deuxième tâche")).toBeInTheDocument();
    expect(screen.getByText("2 tâches")).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        error="API indisponible"
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByTestId("error")).toBeInTheDocument();
    expect(screen.getByText("Erreur : API indisponible")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        error={null}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(screen.getByText("Aucune tâche")).toBeInTheDocument();
  });

  it("uses singular labels when there is one task and one completed task", () => {
    render(
      <TaskList
        tasks={[mockTasks[1]]}
        loading={false}
        error={null}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("1 tâche")).toBeInTheDocument();
    expect(screen.getByText("1 terminée")).toBeInTheDocument();
  });
});
