import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import { toast } from "sonner";

vi.mock("@/contexts/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const login = vi.fn();
const demoLogin = vi.fn();

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard loaded</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    login,
    demoLogin,
  } as ReturnType<typeof useAuth>);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Login page", () => {
  it("requires credentials before attempting authentication", () => {
    renderLogin();
    const form = screen
      .getByRole("button", { name: /authenticate & enter console/i })
      .closest("form");

    fireEvent.submit(form!);

    expect(login).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Please enter your credentials and passkey");
  });

  it("navigates to the dashboard after successful authentication", async () => {
    login.mockResolvedValue(true);
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("operator ya officer@smartcity.gov"), {
      target: { value: "officer@smartcity.gov" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter encrypted password"), {
      target: { value: "passkey" },
    });
    fireEvent.click(screen.getByRole("button", { name: /authenticate & enter console/i }));

    expect(await screen.findByText("Dashboard loaded")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith("officer@smartcity.gov", "passkey");
    expect(toast.success).toHaveBeenCalled();
  });

  it("stays on the login page when authentication fails", async () => {
    login.mockResolvedValue(false);
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("operator ya officer@smartcity.gov"), {
      target: { value: "officer@smartcity.gov" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter encrypted password"), {
      target: { value: "wrong-passkey" },
    });
    fireEvent.click(screen.getByRole("button", { name: /authenticate & enter console/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(
      "Authentication Failed",
      expect.objectContaining({ description: expect.any(String) }),
    ));
    expect(screen.getByRole("heading", { name: "Operator Sign In" })).toBeInTheDocument();
    expect(screen.queryByText("Dashboard loaded")).not.toBeInTheDocument();
  });

  it("uses the selected demo role and navigates on success", async () => {
    demoLogin.mockResolvedValue(true);
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /commander/i }));

    expect(await screen.findByText("Dashboard loaded")).toBeInTheDocument();
    expect(demoLogin).toHaveBeenCalledWith("admin");
  });
});
