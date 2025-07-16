import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { ExecutionState, ExecutionLog, ValidationResult } from '@/types/pipeline';

interface NodeExecution {
  id: string;
  name: string;
  type: string;
  duration: number;
}

export function usePipelineExecution() {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    currentNode: null,
    completedNodes: new Set(),
    logs: []
  });
  
  const [nodeStatuses, setNodeStatuses] = useState<Map<string, 'idle' | 'running' | 'completed' | 'error'>>(
    new Map()
  );

  // Validate pipeline structure
  const validatePipeline = useCallback((nodes: Node[], edges: Edge[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (nodes.length === 0) {
      errors.push('Pipeline is empty. Add some nodes to get started.');
      return { isValid: false, errors, warnings };
    }

    // Check for data source
    const dataSources = nodes.filter(node => 
      (node.data as any)?.nodeType?.name === 'Data Source'
    );
    if (dataSources.length === 0) {
      errors.push('Pipeline must have at least one Data Source node.');
    }

    // Check for sink
    const sinks = nodes.filter(node => 
      (node.data as any)?.nodeType?.name === 'Sink'
    );
    if (sinks.length === 0) {
      warnings.push('Pipeline should have at least one Sink node.');
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
    if (disconnectedNodes.length > 0 && nodes.length > 1) {
      warnings.push(`${disconnectedNodes.length} node(s) are not connected to the pipeline.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // Topological sort for execution order
  const getExecutionOrder = useCallback((nodes: Node[], edges: Edge[]): string[] => {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize graph
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build adjacency list and calculate in-degrees
    edges.forEach(edge => {
      graph.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Find nodes with no incoming edges (start nodes)
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    const executionOrder: string[] = [];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      executionOrder.push(nodeId);

      // Process all neighbors
      graph.get(nodeId)?.forEach(neighborId => {
        const newInDegree = (inDegree.get(neighborId) || 0) - 1;
        inDegree.set(neighborId, newInDegree);
        if (newInDegree === 0) {
          queue.push(neighborId);
        }
      });
    }

    return executionOrder;
  }, []);

  // Simulate node execution
  const executeNode = useCallback(async (node: Node): Promise<void> => {
    const nodeData = node.data as any;
    const nodeType = nodeData?.nodeType?.name || 'Unknown';
    const nodeName = nodeData?.label || 'Unnamed Node';

    // Simulate processing time based on node type
    const processingTimes = {
      'Data Source': 1000 + Math.random() * 1000,
      'Transformer': 1500 + Math.random() * 1000,
      'Model': 2000 + Math.random() * 1500,
      'Sink': 800 + Math.random() * 500
    };
    
    const duration = processingTimes[nodeType as keyof typeof processingTimes] || 1000;

    // Set node as running
    setNodeStatuses(prev => new Map(prev).set(node.id, 'running'));
    setExecutionState(prev => ({
      ...prev,
      currentNode: nodeName
    }));

    // Add start log
    const startLog: ExecutionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      nodeId: node.id,
      nodeName,
      message: `Started processing...`,
      type: 'info'
    };

    setExecutionState(prev => ({
      ...prev,
      logs: [...prev.logs, startLog]
    }));

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, duration));

    // Generate completion message based on node type
    const completionMessages = {
      'Data Source': `Loaded ${Math.floor(Math.random() * 900 + 100)} records from data source`,
      'Transformer': `Applied ${Math.floor(Math.random() * 5 + 1)} transformation steps`,
      'Model': `Generated predictions with ${(Math.random() * 0.15 + 0.85).toFixed(3)} accuracy`,
      'Sink': `Saved ${Math.floor(Math.random() * 900 + 100)} results to destination`
    };

    const completionLog: ExecutionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      nodeId: node.id,
      nodeName,
      message: completionMessages[nodeType as keyof typeof completionMessages] || 'Processing completed',
      type: 'success'
    };

    // Mark node as completed
    setNodeStatuses(prev => new Map(prev).set(node.id, 'completed'));
    setExecutionState(prev => ({
      ...prev,
      currentNode: null,
      completedNodes: new Set([...prev.completedNodes, node.id]),
      logs: [...prev.logs, completionLog]
    }));
  }, []);

  // Execute the entire pipeline
  const executePipeline = useCallback(async (nodes: Node[], edges: Edge[]) => {
    const validation = validatePipeline(nodes, edges);
    
    if (!validation.isValid) {
      const errorLog: ExecutionLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        nodeId: '',
        nodeName: 'Pipeline',
        message: `Execution failed: ${validation.errors.join(', ')}`,
        type: 'error'
      };
      
      setExecutionState(prev => ({
        ...prev,
        logs: [...prev.logs, errorLog]
      }));
      return;
    }

    // Start execution
    setExecutionState(prev => ({
      ...prev,
      isExecuting: true,
      completedNodes: new Set(),
      logs: [...prev.logs, {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        nodeId: '',
        nodeName: 'Pipeline',
        message: 'Starting pipeline execution...',
        type: 'info'
      }]
    }));

    // Reset all node statuses
    setNodeStatuses(new Map());

    try {
      const executionOrder = getExecutionOrder(nodes, edges);
      const nodeMap = new Map(nodes.map(node => [node.id, node]));

      // Execute nodes in topological order
      for (const nodeId of executionOrder) {
        const node = nodeMap.get(nodeId);
        if (node) {
          await executeNode(node);
        }
      }

      // Execution completed
      const completionLog: ExecutionLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        nodeId: '',
        nodeName: 'Pipeline',
        message: `Pipeline execution completed successfully. Processed ${executionOrder.length} nodes.`,
        type: 'success'
      };

      setExecutionState(prev => ({
        ...prev,
        isExecuting: false,
        logs: [...prev.logs, completionLog]
      }));

    } catch (error) {
      const errorLog: ExecutionLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        nodeId: '',
        nodeName: 'Pipeline',
        message: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      };

      setExecutionState(prev => ({
        ...prev,
        isExecuting: false,
        logs: [...prev.logs, errorLog]
      }));
    }
  }, [validatePipeline, getExecutionOrder, executeNode]);

  const stopExecution = useCallback(() => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
      currentNode: null
    }));
    
    setNodeStatuses(prev => {
      const newStatuses = new Map(prev);
      newStatuses.forEach((status, nodeId) => {
        if (status === 'running') {
          newStatuses.set(nodeId, 'idle');
        }
      });
      return newStatuses;
    });
  }, []);

  const resetExecution = useCallback(() => {
    setExecutionState({
      isExecuting: false,
      currentNode: null,
      completedNodes: new Set(),
      logs: []
    });
    setNodeStatuses(new Map());
  }, []);

  return {
    executionState,
    nodeStatuses,
    executePipeline,
    stopExecution,
    resetExecution,
    validatePipeline
  };
}