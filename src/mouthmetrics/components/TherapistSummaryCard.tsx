import React, { useState } from "react";

interface Props {
  summaryText: string;
}

export function TherapistSummaryCard({ summaryText }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900">Practice Summary</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ready to share with your therapist</p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            copied
              ? "bg-emerald-100 text-emerald-700"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          {copied ? (
            <>
              <span>✓</span>
              Copied!
            </>
          ) : (
            <>
              <span>⎘</span>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-5">
        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 rounded-xl p-4 overflow-auto max-h-96">
          {summaryText}
        </pre>
      </div>
      <div className="px-5 pb-4 text-xs text-slate-400 border-t border-slate-100 pt-3">
        This summary describes visible practice behaviour only. It is not a clinical assessment.
      </div>
    </div>
  );
}
