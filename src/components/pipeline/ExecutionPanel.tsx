import React from 'react';
import { Play, Square, RotateCcw, Terminal, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ExecutionState, ExecutionLog } from '@/types/pipeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExecutionPanelProps {
  executionState: ExecutionState;
  onExecute: () => void;
  onStop: () => void;
  onReset: () => void;
  canExecute: boolean;
}

const logIcons = {
  info: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle
} as const;

const logStyles = {
  info: 'text-primary',
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning'
} as const;

function LogEntry({ log }: { log: ExecutionLog }) {
  const IconComponent = logIcons[log.type];
  const iconClass = logStyles[log.type];
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
      <IconComponent className={cn("w-4 h-4 mt-0.5 flex-shrink-0", iconClass)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{log.nodeName}</span>
          <Badge variant="outline" className="text-xs">
            {log.timestamp.toLocaleTimeString()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{log.message}</p>
      </div>
    </div>
  );
}

export function ExecutionPanel({
  executionState,
  onExecute,
  onStop,
  onReset,
  canExecute
}: ExecutionPanelProps) {
  const { isExecuting, currentNode, completedNodes, logs } = executionState;
  
  return (
    <Card className="flex-1 shadow-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Execution
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {isExecuting && (
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                <Clock className="w-3 h-3 mr-1" />
                Running...
              </Badge>
            )}
            
            {!isExecuting && completedNodes.size > 0 && (
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onExecute}
            disabled={!canExecute || isExecuting}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Play className="w-4 h-4 mr-2" />
            Execute Pipeline
          </Button>
          
          {isExecuting && (
            <Button variant="destructive" onClick={onStop}>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
          
          <Button variant="outline" onClick={onReset} disabled={isExecuting}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        
        {/* Execution Status */}
        {currentNode && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Currently executing:</span> {currentNode}
            </p>
          </div>
        )}
        
        {/* Execution Logs */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Execution Logs</h4>
          
          <ScrollArea className="h-64 pr-4">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No execution logs yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map(log => (
                  <LogEntry key={log.id} log={log} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}