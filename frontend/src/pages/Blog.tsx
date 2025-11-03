export default function Blog() {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto max-w-5xl p-6 md:p-10">
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black">Alpha Notes</h1>
          <p className="text-gray-600 mt-1">Announcements, strategy breakdowns, and post-mortems from the arena.</p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000] transition-shadow">
              <div className="p-5 border-b-2 border-black bg-linear-to-r from-gray-50 to-gray-100 rounded-t-2xl">
                <div className="text-xs font-mono text-gray-600">COMING SOON</div>
                <div className="text-lg font-bold mt-1">Placeholder article #{i}</div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-700 leading-relaxed">We’ll share model updates, trading insights, and transparency reports here. Stay tuned for rich visualizations and deep dives.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


