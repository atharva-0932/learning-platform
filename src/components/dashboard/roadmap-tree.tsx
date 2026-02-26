"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Lock, ChevronDown } from "lucide-react";

type RoadmapNode = {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  items?: RoadmapNode[];
  children?: RoadmapNode[];
  status?: "completed" | "in-progress" | "required" | string;
  [key: string]: any;
};

type RoadmapTreeProps = {
  data: RoadmapNode[] | RoadmapNode; // list or root node
  onNodeClick?: (title: string, node?: RoadmapNode) => void;
  initiallyCollapsed?: boolean;
};

function getNodeId(node: RoadmapNode) {
  return String(node.id ?? node.slug ?? node.title ?? node.name ?? Math.random().toString(36).slice(2));
}

function getChildren(node: RoadmapNode): RoadmapNode[] | undefined {
  return node.items ?? node.children ?? undefined;
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-green-500/10 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
      </span>
    );
  }

  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-600 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
      </span>
    );
  }

  // required or default
  return (
    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-red-500/10 text-red-600 text-sm">
      <Lock className="w-4 h-4" />
    </span>
  );
}

export default function RoadmapTree({ data, onNodeClick, initiallyCollapsed = true }: RoadmapTreeProps) {
  // track open state by node id
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setOpen((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  const handleClick = useCallback(
    (node: RoadmapNode) => {
      const title = node.title ?? node.name ?? "";
      if (onNodeClick) onNodeClick(title, node);
    },
    [onNodeClick]
  );

  const renderNode = (node: RoadmapNode, depth = 0) => {
    const nodeId = getNodeId(node);
    const children = getChildren(node) ?? [];
    const hasChildren = Array.isArray(children) && children.length > 0;
    const isOpen = open[nodeId] ?? !initiallyCollapsed;

    // status classes
    const status = node.status ?? "completed";
    const statusClasses =
      status === "completed"
        ? "bg-green-500/10 text-green-600"
        : status === "in-progress"
        ? "bg-yellow-500/10 text-yellow-600"
        : "bg-red-500/10 text-red-600";

    return (
      <div key={nodeId} className={`relative pl-4 mt-2`}>
        <div className="flex items-start gap-3">
          {/* left connector dot/icon */}
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${status === "completed" ? "bg-green-600" : status === "in-progress" ? "bg-yellow-600" : "bg-red-600"}`} />
          </div>

          <div className="flex-1">
            <div
              className={`flex items-center justify-between gap-3 p-2 rounded-md cursor-pointer transition-shadow hover:shadow-sm ${statusClasses}`}
              onClick={() => handleClick(node)}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm">{node.title ?? node.name}</div>
                    <StatusBadge status={status} />
                  </div>
                  {node.description && <div className="text-xs text-muted-foreground mt-1">{node.description}</div>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasChildren && (
                  <button
                    aria-expanded={isOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(nodeId);
                    }}
                    className="p-1 rounded-md hover:bg-slate-100"
                    title={isOpen ? "Collapse" : "Expand"}
                  >
                    <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Children list with connector */}
            <AnimatePresence initial={false}>
              {hasChildren && isOpen && (
                <motion.div
                  key={nodeId + "-children"}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="pl-4 border-l-2 border-muted/30 mt-2"
                >
                  {children.map((c) => renderNode(c, depth + 1))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  // normalize root to array
  const roots: RoadmapNode[] = Array.isArray(data) ? data : [data];

  return <div className="w-full text-sm">{roots.map((n) => renderNode(n, 0))}</div>;
}
