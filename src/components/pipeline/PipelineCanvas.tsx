import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  OnConnect,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import { CustomNode } from './CustomNode';
import { PipelineNode, NodeType } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface PipelineCanvasProps {
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  nodeStatuses: Map<string, 'idle' | 'running' | 'completed' | 'error'>;
}

const nodeTypes = {
  'pipeline-node': CustomNode
};

function PipelineCanvasContent({ onNodesChange, onEdgesChange, nodeStatuses }: PipelineCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
  const [draggedNodeType, setDraggedNodeType] = useState<NodeType | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Handle node creation from drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeTypeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeTypeData) return;

      const nodeType: NodeType = JSON.parse(nodeTypeData);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'pipeline-node',
        position,
        data: {
          label: nodeType.name,
          nodeType,
          status: 'idle'
        },
      };

      setNodes((nds) => {
        const updated = nds.concat(newNode);
        onNodesChange(updated);
        return updated;
      });
    },
    [screenToFlowPosition, setNodes, onNodesChange]
  );

  // Handle edge connections with validation
  const handleConnect: OnConnect = useCallback(
    (params) => {
      // Validate connection rules
      if (params.source === params.target) {
        console.warn('Cannot connect node to itself');
        return;
      }

      // Check for cycles (simple check)
      const wouldCreateCycle = (sourceId: string, targetId: string): boolean => {
        const visited = new Set<string>();
        const stack = [targetId];

        while (stack.length > 0) {
          const currentId = stack.pop()!;
          if (currentId === sourceId) return true;
          if (visited.has(currentId)) continue;
          visited.add(currentId);

          // Find all edges where current node is source
          const outgoingEdges = edges.filter(edge => edge.source === currentId);
          stack.push(...outgoingEdges.map(edge => edge.target));
        }
        return false;
      };

      if (wouldCreateCycle(params.source!, params.target!)) {
        console.warn('Connection would create a cycle');
        return;
      }

      const newEdge = addEdge(
        {
          ...params,
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'hsl(var(--primary))' }
        },
        edges
      );
      
      setEdges(newEdge);
      onEdgesChange(newEdge);
    },
    [edges, setEdges, onEdgesChange]
  );

  // Update node statuses
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: nodeStatuses.get(node.id) || 'idle'
        }
      }))
    );
  }, [nodeStatuses, setNodes]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChangeInternal(changes);
          onNodesChange(nodes);
        }}
        onEdgesChange={(changes) => {
          onEdgesChangeInternal(changes);
          onEdgesChange(edges);
        }}
        onConnect={handleConnect}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        nodeTypes={nodeTypes}
        className="bg-gradient-canvas"
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          gap={20}
          size={1}
          className="opacity-30"
        />
        <Controls 
          className="bg-card border shadow-panel"
        />
        <MiniMap 
          className="bg-card border shadow-panel"
          nodeClassName={(node) => {
            const nodeType = (node.data as any)?.nodeType?.name || '';
            switch (nodeType) {
              case 'Data Source': return 'fill-node-data-source';
              case 'Transformer': return 'fill-node-transformer';
              case 'Model': return 'fill-node-model';
              case 'Sink': return 'fill-node-sink';
              default: return 'fill-muted';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function PipelineCanvas(props: PipelineCanvasProps) {
  return (
    <ReactFlowProvider>
      <PipelineCanvasContent {...props} />
    </ReactFlowProvider>
  );
}