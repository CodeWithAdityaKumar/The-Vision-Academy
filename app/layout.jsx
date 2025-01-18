import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';
import 'plyr/dist/plyr.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navigation />
            {children}
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: 'The Vision Academy',
  description: 'Welcome to The Vision Academy',
  icons: {
    icon: '/images/logos/transparent/3.png',
  },
};