import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navigation />
          <AuthProvider>
            {children}
          </AuthProvider>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}