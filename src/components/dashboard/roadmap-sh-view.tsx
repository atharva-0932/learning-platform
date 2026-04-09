"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getRoadmap, updateRoadmapProgress } from "@/lib/api";
import { RoadmapFlowchart } from "@/components/dashboard/roadmap-flowchart";
import { RoadmapShFlowchart } from "@/components/dashboard/roadmap-sh-flowchart";
import { toast } from "sonner";

interface Milestone {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  completed?: boolean;
}

interface RoadmapData {
  target_role: string;
  roadmap: Milestone[];
  roadmap_sh_url: string | null;
  roadmap_sh_id: string | null;
  roadmap_sh_raw?: { nodes: any[]; edges: any[] } | null;
}

export function RoadmapShView({
  userId,
  targetRole,
  onLoad,
}: {
  userId: string;
  targetRole: string;
  onLoad?: (data: RoadmapData) => void;
}) {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flowchartHeight, setFlowchartHeight] = useState(720);

  useEffect(() => {
    const updateHeight = () => {
      const reservedChrome = window.innerWidth < 768 ? 220 : 240;
      setFlowchartHeight(Math.max(520, window.innerHeight - reservedChrome));
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const refresh = () => {
    setLoading(true);
    getRoadmap(userId, targetRole)
      .then((result) => {
        setData(result);
        onLoad?.(result);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleToggleComplete = async (milestone: Milestone) => {
    if (!data) return;
    const newCompleted = !milestone.completed;
    try {
      await updateRoadmapProgress(userId, milestone.title, newCompleted);
      toast.success(newCompleted ? "Milestone completed!" : "Milestone marked incomplete");
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    getRoadmap(userId, targetRole)
      .then((result) => {
        setData(result);
        onLoad?.(result);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId, targetRole, onLoad]);

  if (loading) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Building your roadmap...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">{error || "Failed to load roadmap"}</p>
        </CardContent>
      </Card>
    );
  }

  const { roadmap, roadmap_sh_url, roadmap_sh_id, roadmap_sh_raw } = data;
  const useRoadmapSh = roadmap_sh_raw && roadmap_sh_raw.nodes?.length > 0;
  const completedCount = roadmap.filter((m) => m.completed).length;
  const progressPercent = roadmap.length ? (completedCount / roadmap.length) * 100 : 0;

  return (
    <Card className="overflow-hidden border shadow-sm h-full min-h-[calc(100dvh-9rem)]">
      <CardHeader className="py-4 px-6 border-b bg-muted/20 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Map className="w-4 h-4 text-primary" />
              {targetRole} Roadmap
            </CardTitle>
            <CardDescription className="text-sm mt-0.5">
              Step-by-step guide to becoming a {targetRole}
            </CardDescription>
          </div>
          {roadmap_sh_url && (
            <a
              href={roadmap_sh_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline shrink-0"
            >
              Open on roadmap.sh
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        {!useRoadmapSh && roadmap.length > 0 && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {completedCount}/{roadmap.length} completed
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-1 min-h-0">
        {useRoadmapSh ? (
          <RoadmapShFlowchart
            nodes={roadmap_sh_raw!.nodes}
            edges={roadmap_sh_raw!.edges}
            height={flowchartHeight}
          />
        ) : (
          <RoadmapFlowchart
            milestones={roadmap}
            onToggleComplete={handleToggleComplete}
            height={flowchartHeight}
          />
        )}
      </CardContent>
    </Card>
  );
}
