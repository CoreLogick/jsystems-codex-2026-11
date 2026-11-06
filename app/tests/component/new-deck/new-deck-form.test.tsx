import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NewDeckForm } from "@/components/new-deck/new-deck-form";

describe("NewDeckForm", () => {
  it("renders the persisted initial locale without translating educational content", () => {
    render(<NewDeckForm initialLocale="pl" />);
    expect(screen.getByRole("heading", { name: "Utwórz prezentację powtórkową" })).toBeTruthy();
    expect(screen.getByText("English", { selector: "output" })).toBeTruthy();
  });
  it("reports every invalid required field and does not submit", async () => {
    const createSession = vi.fn();
    render(<NewDeckForm createSession={createSession} />);

    fireEvent.change(screen.getByLabelText("Grade"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Material type"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Create deck" }));

    const errors = await screen.findAllByRole("alert");
    expect(errors.map((item) => item.textContent)).toEqual(
      expect.arrayContaining(["Enter a book name.", "Enter a chapter.", "Select a grade.", "Select a material type."]),
    );
    expect(createSession).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Book name", { exact: true })).toBeTruthy();
    expect(screen.getByLabelText("Grade", { exact: true })).toBeTruthy();
    expect(screen.getByLabelText("Grade", { exact: true }).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Material type", { exact: true }).getAttribute("aria-invalid")).toBe("true");
  });

  it("preserves values while switching every control to Polish", () => {
    render(<NewDeckForm />);
    fireEvent.change(screen.getByLabelText("Book name"), { target: { value: "English Quest 2" } });
    fireEvent.change(screen.getByLabelText("Chapter name or number"), { target: { value: "Unit 4" } });
    fireEvent.change(screen.getByLabelText("Special focus (optional)"), { target: { value: "device vocabulary" } });

    fireEvent.click(screen.getByRole("button", { name: "PL" }));

    expect((screen.getByLabelText("Nazwa podręcznika") as HTMLInputElement).value).toBe("English Quest 2");
    expect((screen.getByLabelText("Rozdział - nazwa lub numer") as HTMLInputElement).value).toBe("Unit 4");
    expect((screen.getByLabelText("Dodatkowe wskazówki (opcjonalnie)") as HTMLTextAreaElement).value).toBe("device vocabulary");
    expect(document.cookie).toContain("emg_locale=pl");
  });

  it("submits the shared contract and offers no upload control", async () => {
    const createSession = vi.fn().mockResolvedValue({ id: "session-1" });
    const { container } = render(<NewDeckForm createSession={createSession} />);

    fireEvent.change(screen.getByLabelText("Book name"), { target: { value: "English Quest 2" } });
    fireEvent.change(screen.getByLabelText("Chapter name or number"), { target: { value: "Unit 4" } });
    fireEvent.change(screen.getByLabelText("Special focus (optional)"), { target: { value: "device vocabulary" } });
    fireEvent.click(screen.getByRole("button", { name: "Create deck" }));

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith({
        locale: "en",
        subject: "english",
        book: "English Quest 2",
        chapter: "Unit 4",
        grade: 2,
        deckType: "summary",
        focus: "device vocabulary",
      }),
    );
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByText("English", { selector: "output" })).toBeTruthy();
  });

  it("uses labelled controls and visible example material images", () => {
    render(<NewDeckForm />);
    const form = screen.getByRole("form", { name: "New deck" });
    expect(within(form).getAllByRole("combobox")).toHaveLength(2);
    expect(screen.getAllByRole("img")).toHaveLength(5);
    for (const image of screen.getAllByRole("img")) expect(image.getAttribute("alt")).toBeTruthy();
    expect(screen.getByRole("link", { name: "D Deck Copilot" })).toBeTruthy();
  });

  it("translates existing validation errors and accessible shell labels", async () => {
    render(<NewDeckForm />);
    fireEvent.click(screen.getByRole("button", { name: "Create deck" }));
    await screen.findByText("Enter a book name.");
    fireEvent.click(screen.getByRole("button", { name: "PL" }));
    expect(screen.getByText("Wpisz nazwę podręcznika.")).toBeTruthy();
    expect(screen.queryByText("Enter a book name.")).toBeNull();
    expect(screen.getByRole("navigation", { name: "Nawigacja główna" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Język interfejsu" })).toBeTruthy();
    expect(document.documentElement.lang).toBe("pl");
    expect(screen.getByText("5 zdjęć")).toBeTruthy();
  });

  it("reports an oversized optional focus instead of silently refusing submission", async () => {
    const createSession = vi.fn();
    render(<NewDeckForm createSession={createSession} />);
    fireEvent.change(screen.getByLabelText("Book name"), { target: { value: "Synthetic book" } });
    fireEvent.change(screen.getByLabelText("Chapter name or number"), { target: { value: "Unit 1" } });
    fireEvent.change(screen.getByLabelText("Special focus (optional)"), { target: { value: "a".repeat(2001) } });
    fireEvent.click(screen.getByRole("button", { name: "Create deck" }));
    expect(await screen.findByText("Use at most 2000 characters for special focus.")).toBeTruthy();
    expect(createSession).not.toHaveBeenCalled();
  });
});
