import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Aierra’s Journal | Global Property Intelligence", description: "Independent property market intelligence, transaction data, city reports and research.", robots: { index: false, follow: false } };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}