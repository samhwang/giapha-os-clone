import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Person } from "../../members/types";

import { createPerson } from "../../../test/fixtures";
import { useDashboardStore } from "../../dashboard/store/dashboardStore";
import FamilyNodeCard from "./FamilyNodeCard";

const makePerson = (overrides: Partial<Person> = {}) => createPerson(overrides) as Person;

describe("FamilyNodeCard", () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });
  it("renders person name", () => {
    const person = makePerson({ fullName: "Vạn Công Trí" });
    render(<FamilyNodeCard person={person} />);
    expect(screen.getByText("Vạn Công Trí")).toBeInTheDocument();
  });

  it("renders avatar placeholder when no avatarUrl", () => {
    const person = makePerson({ fullName: "Test", avatarUrl: null });
    render(<FamilyNodeCard person={person} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders avatar image when avatarUrl is provided", () => {
    const person = makePerson({ fullName: "Test", avatarUrl: "https://example.com/photo.jpg" });
    render(<FamilyNodeCard person={person} />);
    expect(screen.getByAltText("Test")).toBeInTheDocument();
  });

  it("applies deceased styling", () => {
    const person = makePerson({ isDeceased: true });
    const { container } = render(<FamilyNodeCard person={person} />);
    const deceasedEl = container.querySelector(".grayscale-\\[0\\.4\\]");
    expect(deceasedEl).toBeInTheDocument();
  });

  it("shows ring indicator when isRingVisible is true", () => {
    const person = makePerson();
    const { container } = render(<FamilyNodeCard person={person} isRingVisible />);
    expect(container.textContent).toContain("💍");
  });

  it("shows plus indicator when isPlusVisible is true", () => {
    const person = makePerson();
    const { container } = render(<FamilyNodeCard person={person} isPlusVisible />);
    expect(container.textContent).toContain("+");
  });

  it("opens member modal on click when no custom handlers", async () => {
    const user = userEvent.setup();
    const person = makePerson({ id: "person-123" });
    render(<FamilyNodeCard person={person} />);

    await user.click(screen.getByRole("button"));
    expect(useDashboardStore.getState().memberModalId).toBe("person-123");
  });

  it("calls onClickCard when provided", async () => {
    const user = userEvent.setup();
    const onClickCard = vi.fn();
    const person = makePerson();
    render(<FamilyNodeCard person={person} onClickCard={onClickCard} />);

    const nameEl = screen.getByText(person.fullName);
    await user.click(nameEl);
    expect(onClickCard).toHaveBeenCalled();
  });
});
