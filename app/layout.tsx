import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lignum',
  description: 'A micro-learning game and encyclopedia about trees.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-[#F9F6F0] text-[#1A3622] font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}