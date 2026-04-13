"use client";

import { motion } from "framer-motion";
import { CheckCircle2, PlusCircle } from "lucide-react";

interface ATSKeywordCloudProps {
  present: string[];
  missing: string[];
}

export function ATSKeywordCloud({ present, missing }: ATSKeywordCloudProps) {
  if (present.length === 0 && missing.length === 0) {
    return (
      <p className="py-4 text-center text-sm italic text-muted-foreground">
        No key terms identified for this role.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {present.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              Present ({present.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {present.map((kw, i) => (
              <motion.span
                key={`p-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400"
              >
                <CheckCircle2 className="h-2.5 w-2.5 flex-shrink-0" />
                {kw}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <PlusCircle className="h-3.5 w-3.5 text-[#f59e0b]" />
            <span className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wide">
              Missing ({missing.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((kw, i) => (
              <motion.span
                key={`m-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.04 + (present.length * 0.04) }}
                className="inline-flex items-center gap-1 rounded-full border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-2.5 py-0.5 text-xs font-medium text-[#f59e0b]"
              >
                <PlusCircle className="h-2.5 w-2.5 flex-shrink-0" />
                {kw}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
