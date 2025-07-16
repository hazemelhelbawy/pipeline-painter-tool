# AI Pipeline Editor

A visual, drag-and-drop interface for building and executing AI processing pipelines. Built with React, TypeScript, and React Flow.

![Pipeline Editor Screenshot](docs/screenshot.png)

## Features

- **Visual Pipeline Composition**: Drag and drop nodes to build complex AI workflows
- **Real-time Execution**: Execute pipelines with live progress tracking and logging
- **Node Types**: Data Source, Transformer, Model, and Sink nodes with type-specific processing
- **Connection Validation**: Prevents invalid connections and cycles
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Error Handling**: Comprehensive error states and user feedback
- **API Integration**: Fetches node types from configurable backend service

## Architecture Overview

### Core Components

```
src/
├── components/
│   ├── pipeline/
│   │   ├── NodePalette.tsx       # Draggable node types
│   │   ├── PipelineCanvas.tsx    # Main canvas with React Flow
│   │   ├── CustomNode.tsx        # Custom node components
│   │   └── ExecutionPanel.tsx    # Execution controls and logs
│   └── PipelineEditor.tsx        # Main application component
├── hooks/
│   └── usePipelineExecution.ts   # Pipeline execution logic
├── services/
│   └── nodeService.ts            # API integration
├── types/
│   └── pipeline.ts               # TypeScript definitions
└── tests/
    └── pipeline.test.tsx         # Test suite
```

### Design System

The application uses a custom design system built on Tailwind CSS with semantic color tokens:

- **Primary**: Purple gradient theme (`hsl(248 89% 60%)`)
- **Node Colors**: Type-specific colors for visual distinction
- **Execution States**: Dynamic status indicators with animations
- **Responsive**: Mobile-first design with adaptive layouts

### State Management

- **React Flow**: Manages canvas state, node positions, and connections
- **Custom Hook**: `usePipelineExecution` handles execution logic and validation
- **Local State**: Component-level state for UI interactions

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerization)

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd ai-pipeline-editor

# Install dependencies
npm install

# Start development server
npm run dev
# Application will be available at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Setup (Recommended)

#### Full Stack with Docker Compose
```bash
# Start both frontend and backend services
docker-compose up --build

# Application: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

#### Frontend Only
```bash
# Build the container
docker build -t ai-pipeline-editor .

# Run the application
docker run -p 3000:80 ai-pipeline-editor
```

#### Backend Service Only
```bash
# Build backend container
docker build -f backend/Dockerfile -t pipeline-backend backend/

# Run backend service
docker run -p 8000:8000 pipeline-backend
```

## Usage Guide

### Building a Pipeline

1. **Add Nodes**: Drag node types from the palette onto the canvas
2. **Connect Nodes**: Click and drag from output handles to input handles
3. **Validate**: Check for errors and warnings in the header
4. **Execute**: Click "Execute Pipeline" to run the simulation

### Node Types

- **Data Source**: Entry point for data (green)
- **Transformer**: Data processing and transformation (orange)
- **Model**: Machine learning inference (purple)
- **Sink**: Output destination (pink)

### Execution Features

- **Topological Sorting**: Ensures correct execution order
- **Progress Tracking**: Visual indicators show running/completed nodes
- **Logging**: Detailed execution logs with timestamps
- **Error Handling**: Graceful failure handling and reporting

## API Integration

### Node Service

The application fetches node types from a configurable backend:

```typescript
// Default endpoint
GET /api/nodes

// Response format
[
  { "id": "1", "name": "Data Source" },
  { "id": "2", "name": "Transformer" },
  { "id": "3", "name": "Model" },
  { "id": "4", "name": "Sink" }
]
```

### Mock Backend

A FastAPI mock service is provided for development:

```bash
# Build mock backend
docker build -f backend/Dockerfile -t mock-node-service backend/

# Run mock service
docker run -p 8000:8000 mock-node-service
```

## Testing

### Test Coverage

- **Unit Tests**: Core logic and validation functions
- **Integration Tests**: Component interactions and API calls
- **End-to-End**: Complete user workflows (future enhancement)

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Design Decisions

### Technology Choices

- **React Flow**: Chosen for robust node-based UI capabilities, built-in drag/drop, and extensive customization options
- **TypeScript**: Ensures type safety and improves developer experience
- **Tailwind CSS**: Enables rapid UI development with consistent design tokens
- **Vite**: Fast development server and build tool

### Architecture Patterns

- **Component Composition**: Small, focused components for maintainability
- **Custom Hooks**: Encapsulates complex state logic and side effects
- **Type-Safe APIs**: Full TypeScript coverage for runtime safety
- **Semantic Design**: Consistent color system and responsive patterns

### Performance Considerations

- **React Flow Optimization**: Efficient node rendering and canvas updates
- **State Minimization**: Only store necessary state to prevent re-renders
- **Error Boundaries**: Prevent crashes from component failures
- **Lazy Loading**: Future enhancement for large node libraries

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Maintain test coverage above 80%
- Use semantic commits
- Update documentation for new features

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- React Flow team for the excellent node-based UI library
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible component primitives