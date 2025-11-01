type ToolCall = {
  toolCallType: string;
  metadata: string;
  createdAt: string | Date;
};

type Invocation = {
  id: string;
  response: string;
  createdAt: string | Date;
  model?: { name?: string };
  toolCalls?: ToolCall[];
};

type Props = {
  data: Invocation[] | null;
};

export default function PixelRecentInvocations({ data }: Props) {
  if (!data) return <InvocationsSkeleton />;

  const items = data.map((inv) => ({
    id: inv.id,
    modelName: inv.model?.name ?? "Unknown",
    // normalize createdAt to a Date for safe usage
    createdAt:
      inv.createdAt instanceof Date ? inv.createdAt : new Date(inv.createdAt),
    response: inv.response,
    toolCalls: (inv.toolCalls ?? []).map((tc) => ({
      type: tc.toolCallType,
      createdAt:
        tc.createdAt instanceof Date ? tc.createdAt : new Date(tc.createdAt),
      metadata: tc.metadata,
    })),
  }));

  return (
    <div className="w-full h-full max-h-[86vh] overflow-y-auto bg-[#fffefb] border-2 border-black rounded p-3 font-mono text-black">
      <div className="flex items-center justify-between mb-3">
        <h3 className="uppercase text-sm md:text-base tracking-tight">
          Recent Invocations
        </h3>
        <div className="text-[11px] text-gray-600">
          Entries: <span className="font-bold">{items.length}</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <details
            key={it.id}
            className="group block border-2 border-black rounded-sm bg-[#fbfbf9]"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none p-3 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-sm text-sm">
                  {(it.modelName || "?")[0]}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{it.modelName}</span>
                  <span className="text-[11px] text-gray-500">
                    {it.createdAt.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-[11px] px-2 py-1 border-2 border-black rounded uppercase">
                  ok
                </div>
                <span className="w-3 h-3 block bg-black transform group-open:rotate-90 transition-transform duration-200" />
              </div>
            </summary>

            <div className="px-3 pb-3 pt-2 border-t border-black">
              {it.toolCalls && it.toolCalls.length > 0 && (
                <div className="mb-3">
                  <div className="text-[13px] font-semibold mb-2">
                    Tool Calls
                  </div>
                  <div className="flex flex-col gap-2">
                    {it.toolCalls.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-2 border border-black bg-[#f7f7f6] rounded-sm"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-[12px] font-medium">
                            {tc.type}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {tc.createdAt.toLocaleString()}
                          </div>
                        </div>
                        <pre className="bg-amber-100 p-2 rounded text-[12px] overflow-x-auto font-mono whitespace-pre-wrap leading-snug">
                          {tc.metadata}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-dashed border-black p-2 rounded bg-[#f9f9f7]">
                <pre className="text-[13px] font-mono whitespace-pre-wrap leading-snug">
                  {it.response}
                </pre>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function InvocationsSkeleton() {
  return (
    <div className="w-full h-[320px] md:h-[420px] flex flex-col items-center justify-center bg-[#fffefb] border-2 border-black rounded p-4 font-mono">
      <div className="h-5 w-3/5 bg-black/10 animate-pulse mb-4 rounded-sm" />
      <div className="w-full space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 border-2 border-black bg-[#fbfbf9] rounded-sm"
          >
            <div className="w-10 h-10 bg-black/10 animate-pulse rounded-sm" />
            <div className="flex-1">
              <div className="h-3 w-1/3 bg-black/10 animate-pulse mb-2 rounded-sm" />
              <div className="h-3 w-full bg-black/10 animate-pulse rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
