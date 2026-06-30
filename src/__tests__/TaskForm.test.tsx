import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "../components/TaskForm";

describe("TaskForm", () => {
  it("submits trimmed data and resets fields in create mode", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Titre"), "  Nouvelle tâche  ");
    await user.type(screen.getByLabelText("Description"), "  Détails utiles  ");
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Nouvelle tâche",
      description: "Détails utiles",
    });
    expect(screen.getByLabelText("Titre")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
  });

  it("validates required title and clears the error when typing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Ajouter" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Le titre est requis");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Titre"), "T");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps values in edit mode and calls cancel when provided", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TaskForm
        mode="edit"
        initialValues={{ title: "Ancien titre", description: "Ancienne description" }}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText("Modifier la tâche")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Modifier" }));
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Ancien titre",
      description: "Ancienne description",
    });
    expect(screen.getByLabelText("Titre")).toHaveValue("Ancien titre");

    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("omits an empty optional description", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Titre"), "Sans description");
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Sans description",
      description: undefined,
    });
  });
});
