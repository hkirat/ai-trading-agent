import { useEffect, useState } from "react";
import PerformanceChart from "./components/PerformanceChart";
import RecentInvocations from "./components/RecentInvocations";

const BACKEND_URL = "http://localhost:3000";

/* -----------------------------
 🦴 Skeleton Loaders (Chart & List)
----------------------------- */
function ChartSkeleton() {
  return (
    <div className="w-full lg:w-[60%] bg-white p-6 border border-black">
      <div className="h-6 w-1/3 bg-black/10 animate-pulse mb-4 rounded" />
      <div className="w-full h-[40vh] sm:h-[50vh] md:h-[56vh] border border-black animate-pulse rounded" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="w-full lg:w-[40%] bg-white p-6 border border-black">
      <div className="h-6 w-1/2 bg-black/10 animate-pulse mb-4 rounded" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 border border-black bg-gray-50 rounded-md"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 w-36 bg-black/10 animate-pulse rounded" />
              <div className="h-3 w-24 bg-black/10 animate-pulse rounded" />
            </div>
            <div className="h-3 w-full bg-black/10 animate-pulse rounded mb-2" />
            <div className="h-3 w-5/6 bg-black/10 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -----------------------------
 🧠 Main App Component
----------------------------- */
export default function App() {
  const [performanceData, setPerformanceData] = useState(null);
  const [invocationsData, setInvocationsData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setError("");
      setPerformanceData(null);
      setInvocationsData(null);

      const [perfRes, invocRes] = await Promise.all([
        fetch(`${BACKEND_URL}/performance`),
        fetch(`${BACKEND_URL}/invocations?limit=30`),
      ]);

      if (!perfRes.ok || !invocRes.ok)
        throw new Error("Failed to fetch backend data");

      const perfData = await perfRes.json();
      const invocData = await invocRes.json();

      setPerformanceData(perfData.data);
      setLastUpdated(perfData.lastUpdated);
      setInvocationsData(invocData.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Unable to load data. Please try again.");
    }
  }

  const loading = !performanceData || !invocationsData;

  return (
    <div className="relative h-screen bg-gray-50 text-gray-900 flex flex-col items-center overflow-hidden">
      {/* 🔳 Subtle grid background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:50px_50px]" />

      {/* Header */}
      <header className="w-full border-b-2 border-black flex flex-col justify-center items-center py-4 bg-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-black uppercase text-center">
          100xschool
        </h1>
        <p className="w-full flex justify-end items-end font-light">
          Design by https://x.com/Ignorebysweet
        </p>
      </header>

      {/* ⚙️ Main Content */}
      <main className="w-full flex flex-col lg:flex-row">
        {loading ? (
          <div className="flex flex-col lg:flex-row w-full">
            <ChartSkeleton />
            <ListSkeleton />
          </div>
        ) : (
          <>
            <div className="w-full lg:w-[63%] bg-white border border-black p-4">
              <h2 className="text-lg sm:text-xl mb-4 text-black uppercase text-center">
                Performance Metrics
              </h2>
              <PerformanceChart data={performanceData} />
            </div>
            <div className="w-full lg:w-[37%] border-l border-black">
              <RecentInvocations data={invocationsData} />
            </div>
          </>
        )}
      </main>

      {/* 🕓 Last Updated */}
      {lastUpdated && (
        <div className="mt-4 text-xs text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}

      {/* ❌ Error State */}
      {error && (
        <div className="mt-6 bg-red-100 text-red-700 border border-red-400 px-4 py-2 rounded text-sm">
          {error}
          <button
            onClick={fetchData}
            className="ml-3 underline text-sky-600 hover:text-sky-800"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
