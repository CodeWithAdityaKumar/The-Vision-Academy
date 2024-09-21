import Head from 'next/head'

export default function Contact() {
  return (
    <div>
      <Head>
        <title>Contact Us - The Vision Academy</title>
        <meta name="description" content="Contact The Vision Academy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-4xl font-bold text-center my-8">Contact Us</h1>
        {/* Add contact form and information here */}
      </main>
    </div>
  )
}