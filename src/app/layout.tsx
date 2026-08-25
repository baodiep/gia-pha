import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gia phả dòng họ",
  description: "Quản lý cây gia phả và phân quyền theo nhánh",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
