import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-700 mb-2">NyangaVoyage</h1>
          <p className="text-gray-500 text-sm">Book your bus ticket from anywhere</p>
        </div>
        <Link href="/search">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl text-lg transition">
            Find a Bus
          </button>
        </Link>
      </div>
    </main>
  )
}