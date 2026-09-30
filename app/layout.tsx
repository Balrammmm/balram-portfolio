import type { Metadata, Viewport } from 'next';
import './globals.css';
import './opening.css';
import './refinement.css';
import './polish.css';
export const metadata: Metadata = { title: 'Balram Maurya — A work in progress.', description: 'Beyond one discipline. Electronics, systems, and ideas. An introduction to Balram Maurya.' };
export const viewport: Viewport = { themeColor: '#080807', width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
