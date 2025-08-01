import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { AllTheProviders } from "./test-providers";

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export testing library utilities
export {
  fireEvent,
  render as originalRender,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
export { customRender as render };
