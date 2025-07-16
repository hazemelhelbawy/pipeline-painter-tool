import React from 'react';
import { Database, Zap, Brain, Archive, RefreshCw, AlertTriangle } from 'lucide-react';
import { NodeType } from '@/types/pipeline';
import { useNodeTypes } from '@/services/nodeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const nodeIcons = {
  'Data Source': Database,
  'Transformer': Zap,
  'Model': Brain,
  'Sink': Archive
} as const;

const nodeStyles = {
  'Data Source': 'border-node-data-source hover:bg-node-data-source/10',
  'Transformer': 'border-node-transformer hover:bg-node-transformer/10',
  'Model': 'border-node-model hover:bg-node-model/10',
  'Sink': 'border-node-sink hover:bg-node-sink/10'
} as const;

interface DraggableNodeProps {
  nodeType: NodeType;
}

function DraggableNode({ nodeType }: DraggableNodeProps) {
  const IconComponent = nodeIcons[nodeType.name as keyof typeof nodeIcons];
  const nodeClass = nodeStyles[nodeType.name as keyof typeof nodeStyles];
  
  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-grab",
        "transition-all duration-200 hover:shadow-palette active:cursor-grabbing",
        nodeClass
      )}
    >
      {IconComponent && <IconComponent className="w-5 h-5" />}
      <span className="font-medium text-sm">{nodeType.name}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 text-center">
      <AlertTriangle className="w-8 h-8 text-destructive" />
      <div>
        <p className="font-medium text-sm text-destructive">Failed to Load Nodes</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="w-3 h-3 mr-2" />
        Retry
      </Button>
    </div>
  );
}

export function NodePalette() {
  const { data: nodeTypes, loading, error } = useNodeTypes();
  
  const handleRetry = () => {
    window.location.reload(); // Simple retry mechanism
  };
  
  return (
    <Card className="w-64 shadow-panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full" />
          Node Palette
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && <LoadingSkeleton />}
        
        {error && (
          <ErrorState error={error} onRetry={handleRetry} />
        )}
        
        {!loading && !error && nodeTypes.map(nodeType => (
          <DraggableNode key={nodeType.id} nodeType={nodeType} />
        ))}
        
        {!loading && !error && nodeTypes.length === 0 && (
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">No node types available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}