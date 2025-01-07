import '../app/globals.css'
import Head from 'next/head'
import Layout from '../components/Layout'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <Head>
        <title>The Vision Academy</title>
        <meta name="description" content="Welcome to The Vision Academy" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>
      
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
