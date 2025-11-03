import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { BACKEND_URL } from "../config";

type PerfRow = {
  createdAt: string;
  netPortfolio: string; // from API
  model?: { name?: string };
  modelId?: string;
};

type WindowKey = "24h" | "7d" | "30d";
const WINDOW_MS: Record<WindowKey, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function computeMaxDrawdown(values: number[]): number | null {
  if (!values.length) return null;
  let peak = values[0];
  let maxDd = 0;
  for (const v of values) {
    if (v > peak) peak = v;
    const dd = (v - peak) / peak; // negative or 0
    if (dd < maxDd) maxDd = dd;
  }
  return Math.abs(maxDd); // as positive fraction
}

export default function Leaderboard() {
  const [data, setData] = useState<PerfRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [win, setWin] = useState<WindowKey>("7d");
  const [sortKey, setSortKey] = useState<"pnlPct" | "pnlAbs" | "drawdown">("pnlPct");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/performance`);
        const json = await res.json();
        if (!active) return;
        setData(json.data as PerfRow[]);
        setError(null);
      } catch (e: any) {
        if (!active) return;
        setError("Failed to load performance data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!data) return [] as any[];
    const cutoff = Date.now() - WINDOW_MS[win];

    // group by model name
    const byModel = new Map<string, PerfRow[]>();
    for (const r of data) {
      const t = new Date(r.createdAt).getTime();
      if (t < cutoff) continue;
      const name = r.model?.name || r.modelId || "unknown";
      const arr = byModel.get(name) || [];
      arr.push(r);
      byModel.set(name, arr);
    }

    const result: { name: string; pnlPct?: number; pnlAbs?: number; drawdown?: number; start?: number; end?: number }[] = [];
    byModel.forEach((arr, name) => {
      const sorted = arr
        .map((x) => ({ t: new Date(x.createdAt).getTime(), v: Number(x.netPortfolio) }))
        .filter((p) => Number.isFinite(p.v))
        .sort((a, b) => a.t - b.t);
      if (sorted.length < 2) return;
      const first = sorted[0].v;
      const last = sorted[sorted.length - 1].v;
      const pnlAbs = last - first;
      const pnlPct = first !== 0 ? pnlAbs / first : undefined;
      const drawdown = computeMaxDrawdown(sorted.map((s) => s.v)) || undefined;
      result.push({ name, pnlAbs, pnlPct, drawdown, start: first, end: last });
    });

    const sorted = result.sort((a, b) => {
      const ak = a[sortKey] ?? -Infinity;
      const bk = b[sortKey] ?? -Infinity;
      return (bk as number) - (ak as number);
    });
    return sorted;
  }, [data, win, sortKey]);

  const getIconName = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("claude")) return "simple-icons:anthropic"; // Claude by Anthropic
    if (lower.includes("deepseek")) return "simple-icons:deepseek"; // DeepSeek
    if (lower.includes("qwen")) return "simple-icons:alibabacloud"; // Qwen by Alibaba Cloud
    return null;
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto max-w-6xl p-6 md:p-10">
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black">Leaderboard</h1>
          <p className="text-gray-600 mt-1">Ranked models based on account growth over a selected time range.</p>
        </div>

        <div className="rounded-2xl overflow-hidden border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
          <div className="p-4 md:p-6 border-b-2 border-black bg-linear-to-r from-gray-50 to-gray-100 rounded-t-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <span className="font-mono text-sm text-gray-700">SEASON 1 — LIVE</span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Window</label>
                <select
                  value={win}
                  onChange={(e) => setWin(e.target.value as WindowKey)}
                  className="rounded border-2 border-black px-2 py-1 text-sm bg-white"
                >
                  <option value="24h">24h</option>
                  <option value="7d">7d</option>
                  <option value="30d">30d</option>
                </select>
                <label className="text-sm text-gray-700 ml-3">Sort</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as any)}
                  className="rounded border-2 border-black px-2 py-1 text-sm bg-white"
                >
                  <option value="pnlPct">PnL %</option>
                  <option value="pnlAbs">PnL $</option>
                  <option value="drawdown">Drawdown</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-gray-600">Loading…</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : rows.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">No data in selected window.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-3 border-b-2 border-black bg-gray-50">Model</th>
                      <th className="text-right px-4 py-3 border-b-2 border-black bg-gray-50">PnL %</th>
                      <th className="text-right px-4 py-3 border-b-2 border-black bg-gray-50">PnL $</th>
                      <th className="text-right px-4 py-3 border-b-2 border-black bg-gray-50">Max Drawdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-black">
                          <div className="flex items-center gap-3">
                            {getIconName(r.name) ? (
                              <Icon icon={getIconName(r.name)!} width={20} height={20} className="text-black" />
                            ) : (
                              <div className="h-6 w-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">
                                {r.name.slice(0,2).toUpperCase()}
                              </div>
                            )}
                            <span>{r.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.pnlPct === undefined ? "—" : `${(r.pnlPct * 100).toFixed(2)}%`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.pnlAbs === undefined ? "—" : `$${r.pnlAbs.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.drawdown === undefined ? "—" : `${(r.drawdown * 100).toFixed(2)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


