import { useCallback, useEffect, useState } from "react";
import * as taskApi from "../api/taskApi";
import type { CreateTaskPayload, Task, UpdateTaskPayload } from "../types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (data: CreateTaskPayload) => {
    const newTask = await taskApi.createTask(data);
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const editTask = useCallback(async (id: number, data: UpdateTaskPayload) => {
    const updated = await taskApi.updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const removeTask = useCallback(async (id: number) => {
    await taskApi.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleComplete = useCallback(
    async (id: number) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const updated = await taskApi.updateTask(id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [tasks],
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    addTask,
    editTask,
    removeTask,
    toggleComplete,
  };
}
