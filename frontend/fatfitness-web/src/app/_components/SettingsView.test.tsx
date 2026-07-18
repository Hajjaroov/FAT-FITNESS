import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsView } from "@/app/_components/SettingsView";
import { renderWithProviders } from "@/test/render";
import { refreshAuthSession, subscribeToPush, unsubscribeFromPush } from "@/lib/api";
import { testTokens } from "@/lib/__mocks__/api";

vi.mock("@/lib/api");
vi.mock("@/lib/config", () => ({
  apiBaseUrl: "http://localhost:8080",
  vapidPublicKey: "dGVzdC12YXBpZC1wdWJsaWMta2V5",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/settings",
}));

const fakeEndpoint = "https://push.example.com/test-endpoint";
const fakeSubscriptionJson = {
  endpoint: fakeEndpoint,
  keys: { p256dh: "p256dh-value", auth: "auth-value" },
};

function mockPushSupport({ initiallySubscribed }: { initiallySubscribed: boolean }) {
  const unsubscribe = vi.fn().mockResolvedValue(true);
  const fakeSubscription = {
    endpoint: fakeEndpoint,
    toJSON: () => fakeSubscriptionJson,
    unsubscribe,
  };

  const getSubscription = vi.fn().mockResolvedValue(initiallySubscribed ? fakeSubscription : null);
  const subscribe = vi.fn().mockResolvedValue(fakeSubscription);

  Object.defineProperty(window, "PushManager", {
    value: function PushManager() {},
    configurable: true,
  });

  Object.defineProperty(navigator, "serviceWorker", {
    value: {
      ready: Promise.resolve({ pushManager: { getSubscription, subscribe } }),
    },
    configurable: true,
  });

  Object.defineProperty(window, "Notification", {
    value: class {
      static permission = "default";
      static requestPermission = vi.fn().mockResolvedValue("granted");
    },
    configurable: true,
  });

  return { getSubscription, subscribe, unsubscribe };
}

beforeEach(() => {
  vi.mocked(refreshAuthSession).mockResolvedValue(testTokens);
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("SettingsView push notification toggle", () => {
  it("subscribes to push when the toggle is enabled", async () => {
    const user = userEvent.setup();
    mockPushSupport({ initiallySubscribed: false });

    renderWithProviders(<SettingsView />);

    const toggle = await screen.findByRole("switch", { name: "Push notifications on this device" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await user.click(toggle);

    await waitFor(() => expect(subscribeToPush).toHaveBeenCalledWith(
      { endpoint: fakeEndpoint, p256dh: "p256dh-value", auth: "auth-value" },
      "test-token",
    ));
    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"));
  });

  it("unsubscribes from push when an active toggle is disabled", async () => {
    const user = userEvent.setup();
    const { unsubscribe } = mockPushSupport({ initiallySubscribed: true });

    renderWithProviders(<SettingsView />);

    const toggle = await screen.findByRole("switch", { name: "Push notifications on this device" });
    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"));

    await user.click(toggle);

    await waitFor(() => expect(unsubscribeFromPush).toHaveBeenCalledWith(fakeEndpoint, "test-token"));
    expect(unsubscribe).toHaveBeenCalled();
    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "false"));
  });
});
