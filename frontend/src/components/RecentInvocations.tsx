

type Invocation = {
  id: string;
  response: string;
  createdAt: string | Date;
  model?: { name?: string };
  toolCalls?: { toolCallType: string; metadata: string; createdAt: string | Date }[];
};

type Props = {
  data: Invocation[] | null;
};

export default function RecentInvocations({ data }: Props) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500 font-medium animate-pulse">
        Loading recent invocations...
      </div>
    );
  }

  const items = data.map((inv) => ({
    id: inv.id,
    modelName: inv.model?.name ?? "Unknown Model",
    createdAt: new Date(inv.createdAt),
    response: inv.response,
    toolCalls: (inv.toolCalls ?? []).map((tc) => ({
      type: tc.toolCallType,
      createdAt: new Date(tc.createdAt as any),
      metadata: tc.metadata,
    })),
  }));

  return (
    <div className="h-[1800px] overflow-y-auto px-6 py-4 bg-gradient-to-b from-[#f9fafb] to-[#f0f2f5] dark:from-[#0b0f19] dark:to-[#0a0d16] text-[#111827] dark:text-gray-100 backdrop-blur-xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100 tracking-tight">
        Recent Invocations
      </h2>

      <div className="flex flex-col gap-6">
        {items.map((it) => (
          <details
            key={it.id}
            className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <summary className="flex justify-between items-center cursor-pointer select-none list-none p-4 sm:p-5">
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 group-open:text-black dark:group-open:text-white">
                  {it.modelName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {it.createdAt.toLocaleString()}
                </span>
              </div>
              <span className="text-gray-400 dark:text-gray-500 text-sm group-open:rotate-90 transform transition-transform duration-300">
                ▶
              </span>
            </summary>

            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">
              {/* Tool Calls */}
              {it.toolCalls && it.toolCalls.length > 0 && (
                <div className="mb-4">
                  <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Tool Calls</div>
                  <div className="flex flex-col gap-3">
                    {it.toolCalls.map((tc, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60 p-3 shadow-sm"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {tc.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {tc.createdAt.toLocaleString()}
                          </span>
                        </div>
                        <pre className="text-[13px] text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap leading-snug bg-transparent">
                          {tc.metadata}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response */}
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60 p-3 shadow-sm">
                <pre className="text-[13px] text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap leading-snug">
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
