import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const task: Task = {
	id: 1,
	title: 'Préparer le rendu',
	description: 'Ajouter les tests frontend',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders task details and toggles completion', async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();

		render(<TaskItem task={task} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);

		expect(screen.getByText('Préparer le rendu')).toBeInTheDocument();
		expect(screen.getByText('Ajouter les tests frontend')).toBeInTheDocument();

		await user.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('uses completed styling and completed aria label', () => {
		render(
			<TaskItem
				task={{ ...task, completed: true, description: null }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);

		expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
		expect(screen.getByLabelText('Marquer "Préparer le rendu" comme non terminée')).toBeChecked();
		expect(screen.queryByText('Ajouter les tests frontend')).not.toBeInTheDocument();
	});

	it('edits a task with trimmed values', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();

		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

		await user.click(screen.getByRole('button', { name: 'Modifier' }));
		await user.clear(screen.getByLabelText('Modifier le titre'));
		await user.type(screen.getByLabelText('Modifier le titre'), '  Titre modifié  ');
		await user.clear(screen.getByLabelText('Modifier la description'));
		await user.type(screen.getByLabelText('Modifier la description'), '  Nouvelle description  ');
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Nouvelle description',
		});
		expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
	});

	it('does not save an empty edited title', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();

		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

		await user.click(screen.getByRole('button', { name: 'Modifier' }));
		await user.clear(screen.getByLabelText('Modifier le titre'));
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).not.toHaveBeenCalled();
		expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
	});

	it('cancels editing and restores original values', async () => {
		const user = userEvent.setup();

		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

		await user.click(screen.getByRole('button', { name: 'Modifier' }));
		await user.clear(screen.getByLabelText('Modifier le titre'));
		await user.type(screen.getByLabelText('Modifier le titre'), 'Brouillon');
		await user.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(screen.getByText('Préparer le rendu')).toBeInTheDocument();
		expect(screen.queryByText('Brouillon')).not.toBeInTheDocument();
	});

	it('requires confirmation before deleting', async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();

		render(<TaskItem task={task} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);

		await user.click(screen.getByRole('button', { name: 'Supprimer' }));
		expect(onDelete).not.toHaveBeenCalled();
		expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveTextContent('⚠️');

		await user.click(screen.getByRole('button', { name: 'Supprimer' }));
		expect(onDelete).toHaveBeenCalledWith(1);
	});
});
