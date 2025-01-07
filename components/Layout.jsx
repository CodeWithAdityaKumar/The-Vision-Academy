import { ThemeProvider } from 'next-themes'
import Navigation from './Navigation'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
        <Navigation />
        
        <main className="flex-grow">{children}</main>
        <Footer />
        {/* Add footer here if needed */}
      </div>
    </ThemeProvider>
  )
}