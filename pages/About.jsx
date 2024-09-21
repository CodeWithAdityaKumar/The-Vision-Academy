import Head from 'next/head'

export default function About() {
  return (
    <div>
      <Head>
        <title>About Us - The Vision Academy</title>
        <meta name="description" content="Learn about The Vision Academy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-4xl font-bold text-center my-8">About Us</h1>
        {/* Add more content here */}
      </main>
    </div>
  )
}