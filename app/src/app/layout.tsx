import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deck Copilot",
  description: "Create and refine English revision decks for grades 1-4.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = (await cookies()).get("emg_locale")?.value;
  return (
    <html lang={locale === "pl" ? "pl" : "en"}>
      <body>{children}</body>
    </html>
  );
}
