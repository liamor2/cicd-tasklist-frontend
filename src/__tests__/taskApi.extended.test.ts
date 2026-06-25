import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTask, deleteTask, getTask, getTasks, updateTask } from '../api/taskApi';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

function mockFetch(response: Partial<Response>) {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi complete coverage', () => {
	it('getTask fetches one task', async () => {
		mockFetch({ ok: true, json: () => Promise.resolve(mockTask) } as Response);

		await expect(getTask(1)).resolves.toEqual(mockTask);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
	});

	it('createTask posts json payload', async () => {
		const payload = { title: 'Créer', description: 'Depuis le test' };
		mockFetch({ ok: true, json: () => Promise.resolve({ ...mockTask, ...payload }) } as Response);

		await expect(createTask(payload)).resolves.toMatchObject(payload);
		expect(fetch).toHaveBeenCalledWith('/api/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('updateTask sends a put request', async () => {
		const payload = { completed: true };
		mockFetch({ ok: true, json: () => Promise.resolve({ ...mockTask, completed: true }) } as Response);

		await expect(updateTask(1, payload)).resolves.toMatchObject(payload);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('deleteTask resolves on successful deletion', async () => {
		mockFetch({ ok: true } as Response);

		await expect(deleteTask(1)).resolves.toBeUndefined();
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' });
	});

	it('throws response text for failed json endpoints', async () => {
		mockFetch({ ok: false, status: 500, text: () => Promise.resolve('Serveur indisponible') } as Response);

		await expect(getTasks()).rejects.toThrow('HTTP 500: Serveur indisponible');
	});

	it('throws response text for failed delete', async () => {
		mockFetch({ ok: false, status: 404, text: () => Promise.resolve('Introuvable') } as Response);

		await expect(deleteTask(1)).rejects.toThrow('HTTP 404: Introuvable');
	});
});
