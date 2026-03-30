import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'PDF Editor - SVG Annotation',
    description: 'Next.js PDF annotation assignment with SVG overlay',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
