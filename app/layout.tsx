import { ReactNode } from "react";

import "./globals.css";

import { Comfortaa } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" className="bg-black">
      <body className={comfortaa.className}>{children}</body>
      <Analytics />
    </html>
  );
};

export default RootLayout;