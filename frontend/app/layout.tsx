import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoEngineer – Autonomous AI Software Engineer',
  description: 'Describe a project, let AI plan, generate, and ship it to GitHub automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased relative bg-[#03030f]">
        {/* Ambient gradient orbs */}
        <div className="orb-container" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        {/* Subtle dot grid */}
        <div className="dot-grid" aria-hidden="true" />
        {/* Film grain texture */}
        <div className="grain" aria-hidden="true" />
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
      </body>
    </html>
  );
}
