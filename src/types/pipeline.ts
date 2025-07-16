// Core types for the AI Pipeline Editor

export interface NodeType {
  id: string;
  name: string;
}

export interface PipelineNode {
  id: string;
  type: 'data-source' | 'transformer' | 'model' | 'sink';
  data: {
    label: string;
    nodeType: NodeType;
  };
  position: { x: number; y: number };
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface ExecutionState {
  isExecuting: boolean;
  currentNode: string | null;
  completedNodes: Set<string>;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  nodeId: string;
  nodeName: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface ApiResponse<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

// Node execution interface
export interface NodeExecution {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'error';
}

// Pipeline validation results
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}