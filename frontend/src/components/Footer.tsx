export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} AI Trading Agent. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <a href="/" className="hover:text-gray-900 dark:hover:text-gray-200 transition">Home</a>
          <a href="/performance" className="hover:text-gray-900 dark:hover:text-gray-200 transition">Performance</a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition">Privacy</a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition">Terms</a>
        </div>
      </div>
    </footer>
  )
}


