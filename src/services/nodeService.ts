import React from 'react';
import { NodeType, ApiResponse } from '../types/pipeline';

// Mock API service for fetching node types
export class NodeService {
  private static baseUrl = 'http://localhost:8000';
  
  // Simulate API latency and potential failures
  static async fetchNodeTypes(): Promise<NodeType[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate occasional failures (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Failed to fetch node types from server');
      }
      
      // Mock response that matches the backend specification
      return [
        { id: '1', name: 'Data Source' },
        { id: '2', name: 'Transformer' },
        { id: '3', name: 'Model' },
        { id: '4', name: 'Sink' }
      ];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error occurred');
    }
  }
  
  // Alternative: Fetch from actual backend if available
  static async fetchFromBackend(): Promise<NodeType[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/nodes`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // Fallback to mock if backend is not available
      console.warn('Backend not available, using mock data:', error);
      return this.fetchNodeTypes();
    }
  }
}

// Hook for managing node types API state
export function useNodeTypes(): ApiResponse<NodeType[]> {
  const [state, setState] = React.useState<ApiResponse<NodeType[]>>({
    data: [],
    loading: true,
    error: null
  });
  
  React.useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const nodeTypes = await NodeService.fetchFromBackend();
        setState({ data: nodeTypes, loading: false, error: null });
      } catch (error) {
        setState({ 
          data: [], 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    };
    
    loadNodeTypes();
  }, []);
  
  return state;
}
