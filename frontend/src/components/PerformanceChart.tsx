import  { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Requested line colors: orange, blue, red, black, green (then fallbacks)
const COLORS = [
  "#FF9900", // orange
  "#3366CC", // blue
  "#DC3912", // red
  "#000000", // black
  "#109618", // green


];

export default function PixelPerformanceChart({ data }: { data: any[] }) {
  const { chartData, seriesNames } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return { chartData: [], seriesNames: [] };

    const points = data
      .map((item: any) => ({
        t: new Date(item.createdAt).getTime(),
        name: item.model?.name ?? item.modelId ?? "unknown",
        v: Number(item.netPortfolio),
      }))
      .filter((p) => Number.isFinite(p.v))
      .sort((a, b) => a.t - b.t);

    const names = new Set<string>();
    for (const p of points) names.add(p.name);

    const uniqueTs = Array.from(new Set(points.map((p) => p.t))).sort((a, b) => a - b);
    const gaps: number[] = [];
    for (let i = 1; i < uniqueTs.length; i++) gaps.push(uniqueTs[i] - uniqueTs[i - 1]);
    const medianGap = gaps.length ? gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 60_000;
    const tolerance = Math.min(5 * 60_000, Math.max(5_000, Math.floor((medianGap || 60_000) * 1.5)));

    const rows: any[] = [];
    let bucketStart = points[0].t;
    let bucketEnd = points[0].t;
    let bucketRows: Record<string, number> = {};

    const flush = () => {
      const center = Math.round((bucketStart + bucketEnd) / 2);
      rows.push({ t: center, ...bucketRows });
      bucketRows = {};
    };

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.t - bucketEnd > tolerance) {
        flush();
        bucketStart = p.t;
        bucketEnd = p.t;
      }
      bucketEnd = Math.max(bucketEnd, p.t);
      bucketRows[p.name] = p.v;
    }
    flush();

    return { chartData: rows, seriesNames: Array.from(names.values()) };
  }, [data]);

  return (
    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[480px] p-4 bg-[#fbfaf8] border-2 border-black rounded shadow-sm font-mono">
      <div className="w-full h-full border-2 border-black bg-white overflow-hidden">
        {/* Top pixel header */}
        <div className="py-2 px-3 border-b-2 border-black flex items-center justify-between bg-[#fffefb]">
          <div className="uppercase text-xs md:text-sm tracking-tight">Performance Metrics</div>
          <div className="text-[11px] text-gray-600">chart</div>
        </div>

        {/* Chart */}
        <div className="w-full h-[calc(100%-44px)] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 6, right: 18, bottom: 6, left: 6 }}>
              {/* pixel-like grid lines */}
              <CartesianGrid stroke="#e6e6e6" strokeDasharray="2 2" />

              <XAxis
                dataKey="t"
                type="number"
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => new Date(v).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "#000" }}
              />

              <YAxis tick={{ fontSize: 11, fontFamily: "monospace" }} domain={["dataMin", "dataMax"]} />

              <Tooltip
                labelFormatter={(label: any) => new Date(label).toLocaleString("en-IN")}
                formatter={(value: any) => (typeof value === "number" ? Number(value).toFixed(2) : value)}
              />

              <Legend verticalAlign="top" height={28} wrapperStyle={{ fontFamily: 'monospace', fontSize: 12 }} />

              {seriesNames.map((name: string, idx: number) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  dot={false}
                  strokeWidth={2}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeLinecap="square"
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
