import React, { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { NodePalette } from './pipeline/NodePalette';
import { PipelineCanvas } from './pipeline/PipelineCanvas';
import { ExecutionPanel } from './pipeline/ExecutionPanel';
import { usePipelineExecution } from '@/hooks/usePipelineExecution';
import { Card } from '@/components/ui/card';

export function PipelineEditor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const {
    executionState,
    nodeStatuses,
    executePipeline,
    stopExecution,
    resetExecution,
    validatePipeline
  } = usePipelineExecution();

  const handleExecute = () => {
    executePipeline(nodes, edges);
  };

  const handleNodesChange = (updatedNodes: Node[]) => {
    setNodes(updatedNodes);
  };

  const handleEdgesChange = (updatedEdges: Edge[]) => {
    setEdges(updatedEdges);
  };

  const validation = validatePipeline(nodes, edges);
  const canExecute = validation.isValid && !executionState.isExecuting;

  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Pipeline Editor</h1>
            <p className="text-sm text-muted-foreground">Visual pipeline composition and execution</p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {!validation.isValid && (
            <div className="text-sm text-destructive">
              {validation.errors[0]}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="text-sm text-warning">
              {validation.warnings[0]}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Node Palette */}
        <div className="w-80 p-4 border-r bg-muted/20 overflow-y-auto">
          <NodePalette />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <PipelineCanvas
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            nodeStatuses={nodeStatuses}
          />
          
          {/* Canvas Overlay Instructions */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-dashed">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Get Started</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag nodes from the palette to build your AI pipeline
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Drag • Connect • Execute
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Execution Panel */}
        <div className="w-96 p-4 border-l bg-muted/20 overflow-y-auto">
          <ExecutionPanel
            executionState={executionState}
            onExecute={handleExecute}
            onStop={stopExecution}
            onReset={resetExecution}
            canExecute={canExecute}
          />
        </div>
      </div>
    </div>
  );
}