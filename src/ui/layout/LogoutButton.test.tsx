import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { t } from "../../../test/i18n";
import { renderWithProviders } from "../../../test/render-wrapper";
import LogoutButton from "./LogoutButton";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const mockSignOut = vi.fn(() => Promise.resolve());

vi.mock("../../auth/client", () => ({
  authClient: { signOut: () => mockSignOut() },
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  it("renders logout button", () => {
    renderWithProviders(<LogoutButton />);
    expect(
      screen.getByRole("button", { name: new RegExp(t("auth.logout"), "i") }),
    ).toBeInTheDocument();
  });

  it("calls signOut on click", async () => {
    const { user } = renderWithProviders(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: new RegExp(t("auth.logout"), "i") }));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("shows loading state during logout", async () => {
    let resolveSignOut = () => {};
    mockSignOut.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignOut = resolve;
        }),
    );

    const { user } = renderWithProviders(<LogoutButton />);
    await user.click(screen.getByRole("button", { name: new RegExp(t("auth.logout"), "i") }));

    await waitFor(() => {
      expect(screen.getByText(t("auth.loggingOut"))).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    resolveSignOut();
  });

  it("recovers from logout error", async () => {
    mockSignOut.mockRejectedValue(new Error("Network error"));

    const { user } = renderWithProviders(<LogoutButton />);
    await user.click(screen.getByRole("button", { name: new RegExp(t("auth.logout"), "i") }));

    await waitFor(() => {
      expect(screen.getByRole("button")).not.toBeDisabled();
      expect(screen.getByText(t("auth.logout"))).toBeInTheDocument();
    });
  });
});
