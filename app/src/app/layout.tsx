import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Application Scaffold",
  description: "Local development scaffold.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
