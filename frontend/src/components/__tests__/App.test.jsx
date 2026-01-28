import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";

// Mock matchMedia for components that might use window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("App Component", () => {
  it("renders without crashing", () => {
    // We wrapped App in MemoryRouter because App likely contains Routes but no Router itself (Router is in main.jsx)
    // However, App might also rely on AuthProvider which is inside App.
    // Let's see: App returns <AuthProvider><Routes>...</Routes></AuthProvider>
    // So MemoryRouter should wrap App?
    // Routes must be used within a Router.
    // Yes, MemoryRouter -> App -> AuthProvider -> Routes.
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
  });
});
