"use client";

import { useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Roadmap.sh node types: title, topic, subtopic, paragraph, vertical
interface RoadmapShNodeData {
  label?: string;
  style?: { fontSize?: number; textAlign?: string };
}

function TitleNode({ data }: NodeProps) {
  const label = (data as RoadmapShNodeData).label || "";
  return (
    <div className="px-4 py-2 rounded-lg bg-primary/90 text-primary-foreground font-bold text-lg text-center shadow-md border-2 border-primary relative">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
      {label}
      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
    </div>
  );
}

function TopicNode({ data }: NodeProps) {
  const label = (data as RoadmapShNodeData).label || "";
  return (
    <div className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm text-center shadow border-2 border-blue-600 min-w-[120px] relative">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
      {label}
      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
    </div>
  );
}

function SubtopicNode({ data }: NodeProps) {
  const label = (data as RoadmapShNodeData).label || "";
  return (
    <div className="px-3 py-2 rounded-lg bg-purple-500/90 text-white font-medium text-sm text-center shadow border-2 border-purple-600 min-w-[140px] relative">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
      {label}
      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
    </div>
  );
}

function ParagraphNode({ data }: NodeProps) {
  const label = (data as RoadmapShNodeData).label || "";
  if (!label) return null;
  return (
    <div className="px-3 py-2 rounded bg-muted text-muted-foreground text-xs max-w-[200px] text-center relative">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
      {label}
      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
    </div>
  );
}

function VerticalNode() {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" />
      <div
        className="w-[2px] h-16 bg-primary/50 rounded"
        style={{ borderLeft: "2px dashed hsl(var(--primary))" }}
      />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  title: TitleNode,
  topic: TopicNode,
  subtopic: SubtopicNode,
  paragraph: ParagraphNode,
  vertical: VerticalNode,
};

function transformRoadmapShToReactFlow(
  raw: { nodes: any[]; edges: any[] }
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = raw.nodes.map((n) => {
    const pos = n.position || { x: 0, y: 0 };
    const width = n.width ?? 150;
    const height = n.height ?? 40;
    const nodeType = n.type || "default";
    return {
      id: n.id,
      type: nodeType in nodeTypes ? nodeType : "paragraph",
      position: { x: pos.x, y: pos.y },
      data: { label: n.data?.label ?? "" },
      style: { width, height },
      draggable: false,
    };
  });

  const edges: Edge[] = raw.edges.map((e, i) => ({
    id: e.id || `edge-${i}`,
    source: e.source,
    target: e.target,
    type: e.type === "step" ? "step" : "smoothstep",
    animated: false,
    style: {
      stroke: e.style?.stroke || "hsl(var(--primary))",
      strokeWidth: e.style?.strokeWidth || 2,
      strokeDasharray: e.data?.edgeStyle === "dashed" ? "5 5" : undefined,
    },
  }));

  return { nodes, edges };
}

interface RoadmapShFlowchartProps {
  nodes: any[];
  edges: any[];
  height?: number;
}

export function RoadmapShFlowchart({
  nodes: rawNodes,
  edges: rawEdges,
  height = 600,
}: RoadmapShFlowchartProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => transformRoadmapShToReactFlow({ nodes: rawNodes, edges: rawEdges }),
    [rawNodes, rawEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (rawNodes.length === 0 && rawEdges.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 p-8 text-center text-muted-foreground text-sm">
        No roadmap data available.
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-xl border bg-muted/10 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, minZoom: 0.75 }}
        minZoom={0.3}
        maxZoom={2}
        panOnScroll
        zoomOnScroll={false}
        panOnDrag
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(var(--muted-foreground) / 0.08)" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
