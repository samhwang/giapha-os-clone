import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import LanguageSwitcher from "./LanguageSwitcher";

// Mock cookieStore which doesn't exist in jsdom
const mockCookieSet = vi.fn();
vi.stubGlobal("cookieStore", { set: mockCookieSet });

describe("LanguageSwitcher", () => {
  it("renders language toggle button", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays next language name", () => {
    render(<LanguageSwitcher />);
    // Current language is 'vi' (from test setup), so next is 'en'
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("calls changeLanguage on click", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("button"));

    expect(mockCookieSet).toHaveBeenCalledWith(
      expect.objectContaining({ name: "lang", value: "en", path: "/" }),
    );
  });
});
