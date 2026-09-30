import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeWithSuraj — Learn. Build. Excel.",
  description: "Master modern tech skills with expert-led courses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
