import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { SiteProviders } from "@/app/_components/SiteProviders";

// Renders under the app's real provider stack. Requires the test file to
// vi.mock("@/lib/api") so AuthProvider's mount-time session restore hits the
// manual mock instead of the network.
export function renderWithProviders(ui: ReactNode) {
  return render(<SiteProviders>{ui}</SiteProviders>);
}
