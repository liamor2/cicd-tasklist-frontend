import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as taskApi from "../api/taskApi";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types/task";

const firstTask: Task = {
  id: 1,
  title: "Première",
  description: null,
  completed: false,
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z",
};

const secondTask: Task = {
  id: 2,
  title: "Deuxième",
  description: "Avec détails",
  completed: true,
  createdAt: "2026-01-16T10:00:00Z",
  updatedAt: "2026-01-16T10:00:00Z",
};

vi.mock("../api/taskApi");

const mockedApi = vi.mocked(taskApi);

beforeEach(() => {
  vi.clearAllMocks();
  mockedApi.getTasks.mockResolvedValue([firstTask]);
});

describe("useTasks", () => {
  it("loads tasks on mount", async () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.tasks).toEqual([firstTask]);
  });

  it("stores an Error message when loading fails", async () => {
    mockedApi.getTasks.mockRejectedValueOnce(new Error("API down"));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("API down");
    expect(result.current.tasks).toEqual([]);
  });

  it("stores a fallback message for non Error failures", async () => {
    mockedApi.getTasks.mockRejectedValueOnce("boom");

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Une erreur est survenue");
  });

  it("adds a new task at the beginning", async () => {
    mockedApi.createTask.mockResolvedValueOnce(secondTask);
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTask({ title: "Deuxième" });
    });

    expect(result.current.tasks).toEqual([secondTask, firstTask]);
  });

  it("edits an existing task", async () => {
    const updated = { ...firstTask, title: "Modifiée" };
    mockedApi.updateTask.mockResolvedValueOnce(updated);
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editTask(1, { title: "Modifiée" });
    });

    expect(result.current.tasks).toEqual([updated]);
  });

  it("removes a task", async () => {
    mockedApi.deleteTask.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeTask(1);
    });

    expect(result.current.tasks).toEqual([]);
  });

  it("toggles an existing task", async () => {
    const updated = { ...firstTask, completed: true };
    mockedApi.updateTask.mockResolvedValueOnce(updated);
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(1);
    });

    expect(mockedApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
    expect(result.current.tasks).toEqual([updated]);
  });

  it("does nothing when toggling a missing task", async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(999);
    });

    expect(mockedApi.updateTask).not.toHaveBeenCalled();
    expect(result.current.tasks).toEqual([firstTask]);
  });
});
