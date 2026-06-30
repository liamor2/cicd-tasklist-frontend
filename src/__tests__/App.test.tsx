import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types/task";

vi.mock("../hooks/useTasks");

const mockedUseTasks = vi.mocked(useTasks);

const baseTask: Task = {
  id: 1,
  title: "Brancher les tests",
  description: null,
  completed: false,
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z",
};

function mockUseTasks(tasks: Task[], addTask = vi.fn()) {
  mockedUseTasks.mockReturnValue({
    tasks,
    loading: false,
    error: null,
    loadTasks: vi.fn(),
    addTask,
    editTask: vi.fn(),
    removeTask: vi.fn(),
    toggleComplete: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("App", () => {
  it("renders stats when tasks exist", () => {
    mockUseTasks([baseTask, { ...baseTask, id: 2, completed: true, title: "Terminée" }]);

    render(<App />);

    expect(screen.getByText("Mes Tâches")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Terminées")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
  });

  it("does not render stats when there are no tasks", () => {
    mockUseTasks([]);

    render(<App />);

    expect(screen.queryByText("Total")).not.toBeInTheDocument();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });
});
