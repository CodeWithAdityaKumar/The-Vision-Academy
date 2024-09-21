import '../app/globals.css'
import Layout from '../components/Layout'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
