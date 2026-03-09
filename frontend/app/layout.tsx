import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoEngineer – Autonomous AI Software Engineer',
  description: 'Describe a project, let AI plan, generate, and ship it to GitHub automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-[#1c1917]">
        {children}
      </body>
    </html>
  );
}
