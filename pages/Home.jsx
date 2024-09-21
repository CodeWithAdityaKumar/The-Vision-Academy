import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>The Vision Academy</title>
        <meta name="description" content="Welcome to The Vision Academy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-4xl font-bold text-center my-8">
          Welcome to The Vision Academy
        </h1>
        {/* Add more content here */}
      </main>
    </div>
  )
}