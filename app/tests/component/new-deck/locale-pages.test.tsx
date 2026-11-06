import { describe, expect, it, vi } from "vitest";

const cookie = vi.hoisted(() => ({ value: "pl" }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => cookie }) }));

import NewDeckPage from "@/app/(product)/new/page";
import RootLayout from "@/app/layout";

describe("server locale preference", () => {
  it.each([ ["pl", "pl"], ["en", "en"], ["invalid", "en"] ])("validates cookie %s as %s", async (value, expected) => {
    cookie.value = value;
    const page = await NewDeckPage();
    const layout = await RootLayout({ children: null, params: Promise.resolve({}) });
    expect(page.props.initialLocale).toBe(expected);
    expect(layout.props.lang).toBe(expected);
  });
});
