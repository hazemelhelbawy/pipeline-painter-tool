import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Database, Zap, Brain, Archive, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomNodeData {
  label: string;
  nodeType: { id: string; name: string };
  status?: 'idle' | 'running' | 'completed' | 'error';
}

const nodeIcons = {
  'Data Source': Database,
  'Transformer': Zap,
  'Model': Brain,
  'Sink': Archive
} as const;

const nodeStyles = {
  'Data Source': 'bg-node-data-source border-node-data-source text-white',
  'Transformer': 'bg-node-transformer border-node-transformer text-white',
  'Model': 'bg-node-model border-node-model text-white',
  'Sink': 'bg-node-sink border-node-sink text-white'
} as const;

const statusIcons = {
  running: Play,
  completed: CheckCircle,
  error: AlertCircle
} as const;

const statusStyles = {
  idle: '',
  running: 'ring-2 ring-warning animate-pulse',
  completed: 'ring-2 ring-success',
  error: 'ring-2 ring-destructive'
} as const;

export function CustomNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const IconComponent = nodeIcons[nodeData.nodeType.name as keyof typeof nodeIcons];
  const StatusIcon = nodeData.status && nodeData.status !== 'idle' ? statusIcons[nodeData.status as keyof typeof statusIcons] : null;
  
  const nodeClass = nodeStyles[nodeData.nodeType.name as keyof typeof nodeStyles];
  const statusClass = statusStyles[nodeData.status || 'idle'];
  
  return (
    <div className={cn(
      "relative px-4 py-3 rounded-lg border-2 shadow-node min-w-[140px]",
      "transition-all duration-300 hover:shadow-lg hover:scale-105",
      nodeClass,
      statusClass,
      selected && "ring-2 ring-primary"
    )}>
      {/* Input Handle */}
      {nodeData.nodeType.name !== 'Data Source' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-background border-2 border-current"
        />
      )}
      
      {/* Node Content */}
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent className="w-4 h-4" />}
        <span className="font-medium text-sm">{nodeData.label}</span>
        {StatusIcon && (
          <StatusIcon className="w-3 h-3 ml-auto opacity-80" />
        )}
      </div>
      
      {/* Status Indicator */}
      {nodeData.status === 'running' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-ping" />
      )}
      
      {/* Output Handle */}
      {nodeData.nodeType.name !== 'Sink' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-background border-2 border-current"
        />
      )}
    </div>
  );
}