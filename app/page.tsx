// This tells Next.js we want to use the Link component for navigation between pages
import Link from 'next/link'

// This is the main Homepage component — Next.js automatically uses this as the page at localhost:3000
export default function Home() {
  return (
    // <main> is the outer wrapper of the whole page
    // min-h-screen = takes up at least the full height of the screen
    // bg-gray-50 = very light gray background
    // flex flex-col = stack children vertically
    // items-center = center everything horizontally
    // justify-center = center everything vertically
    // px-4 = small padding on left and right (so content doesn't touch screen edges)
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* This div is the content box — it has a max width so it doesn't stretch too wide on big screens */}
      {/* w-full = take full width available */}
      {/* max-w-md = but never wider than ~448px (medium size) */}
      <div className="w-full max-w-md">

        {/* This div holds the title and subtitle at the top */}
        {/* text-center = center the text */}
        {/* mb-10 = margin bottom (space below this block before the button) */}
        <div className="text-center mb-10">

          {/* The app name — big, bold, green */}
          {/* text-4xl = very large text */}
          {/* font-bold = bold */}
          {/* text-green-700 = dark green color */}
          {/* mb-2 = small space below the title */}
          <h1 className="text-4xl font-bold text-green-700 mb-2">NyangaVoyage</h1>

          {/* The subtitle under the app name */}
          {/* text-gray-500 = medium gray color */}
          {/* text-sm = small font size */}
          <p className="text-gray-500 text-sm">Book your bus ticket from anywhere</p>

        </div>

        {/* Link wraps the button so clicking it navigates to the /search page */}
        {/* href="/search" = where to go when clicked */}
        <Link href="/search">

          {/* The big green button */}
          {/* w-full = stretches to full width of the container */}
          {/* bg-green-600 = green background */}
          {/* hover:bg-green-700 = slightly darker green when mouse hovers over it */}
          {/* text-white = white text */}
          {/* font-semibold = medium-bold text weight */}
          {/* py-4 = padding top and bottom (makes the button tall) */}
          {/* rounded-2xl = very rounded corners */}
          {/* text-lg = large text size */}
          {/* transition = smooth animation when color changes on hover */}
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl text-lg transition">
            Find a Bus
          </button>

        </Link>

      </div>
    </main>
  )
}