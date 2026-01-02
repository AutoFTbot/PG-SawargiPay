import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SawargiPay | Solusi Pembayaran Digital",
  description: "Terima pembayaran QRIS, VA, dan lainnya dengan mudah menggunakan SawargiPay & sawargipay SDK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
