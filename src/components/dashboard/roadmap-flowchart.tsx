"use client";

import { useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Milestone {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  completed?: boolean;
}

interface RoadmapNodeData extends Record<string, unknown> {
  milestone: Milestone;
  index: number;
  onToggleComplete?: (m: Milestone) => void;
}

function RoadmapNode({ data, selected }: NodeProps) {
  const { milestone, index, onToggleComplete } = data as RoadmapNodeData;
  const isCompleted = !!milestone.completed;

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 min-w-[200px] max-w-[280px] transition-all ${
        isCompleted
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-primary/40 bg-card hover:border-primary/60 shadow-md"
      } ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-primary" />
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-muted-foreground">#{index + 1}</span>
          <h3 className="font-bold text-sm leading-tight">{milestone.title}</h3>
          {isCompleted && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
        </div>
        <Badge
          variant="outline"
          className={`text-[9px] uppercase font-bold ${
            milestone.difficulty === "Beginner"
              ? "border-emerald-500/50 text-emerald-700"
              : milestone.difficulty === "Intermediate"
              ? "border-amber-500/50 text-amber-700"
              : "border-red-500/50 text-red-700"
          }`}
        >
          {milestone.difficulty}
        </Badge>
        <p className="text-xs text-muted-foreground line-clamp-2">{milestone.description}</p>
        {onToggleComplete && (
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggleComplete(milestone)}
              className="h-3 w-3"
            />
            <span className="text-[10px] text-muted-foreground">Done</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-primary" />
    </div>
  );
}

const nodeTypes = { roadmap: RoadmapNode };

const NODE_WIDTH = 260;
const NODE_HEIGHT = 140;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 60;

function createFlowElements(
  milestones: Milestone[],
  onToggleComplete?: (m: Milestone) => void
): { nodes: Node<RoadmapNodeData>[]; edges: Edge[] } {
  const nodes: Node<RoadmapNodeData>[] = [];
  const edges: Edge[] = [];

  milestones.forEach((m, i) => {
    const x = i * (NODE_WIDTH + HORIZONTAL_GAP) + 50;
    const y = 50;

    nodes.push({
      id: `node-${i}`,
      type: "roadmap",
      position: { x, y },
      data: {
        milestone: m,
        index: i,
        onToggleComplete,
      },
      draggable: false,
    });

    if (i < milestones.length - 1) {
      edges.push({
        id: `edge-${i}-${i + 1}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
        type: "smoothstep",
        animated: !m.completed,
        style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
      });
    }
  });

  return { nodes, edges };
}

interface RoadmapFlowchartProps {
  milestones: Milestone[];
  onToggleComplete?: (m: Milestone) => void;
  height?: number;
}

export function RoadmapFlowchart({
  milestones,
  onToggleComplete,
  height = 400,
}: RoadmapFlowchartProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => createFlowElements(milestones, onToggleComplete),
    [milestones, onToggleComplete]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (milestones.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 p-8 text-center text-muted-foreground text-sm">
        No milestones in roadmap.
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-lg border bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(var(--muted-foreground) / 0.1)" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) =>
            (n.data as RoadmapNodeData).milestone?.completed ? "hsl(142 76% 36%)" : "hsl(var(--primary))"
          }
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
