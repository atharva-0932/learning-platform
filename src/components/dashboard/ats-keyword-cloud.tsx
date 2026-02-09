"use client";

import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface ATSKeywordCloudProps {
    present: string[];
    missing: string[];
}

export function ATSKeywordCloud({ present, missing }: ATSKeywordCloudProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {present.map((keyword, i) => (
                    <Badge
                        key={`present-${i}`}
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 flex items-center gap-1.5"
                    >
                        <Check className="w-3.5 h-3.5" />
                        {keyword}
                    </Badge>
                ))}
                {missing.map((keyword, i) => (
                    <Badge
                        key={`missing-${i}`}
                        variant="secondary"
                        className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 flex items-center gap-1.5"
                    >
                        <X className="w-3.5 h-3.5" />
                        {keyword}
                    </Badge>
                ))}
            </div>
            {(present.length === 0 && missing.length === 0) && (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                    No key terms identified for this role.
                </p>
            )}
        </div>
    );
}
