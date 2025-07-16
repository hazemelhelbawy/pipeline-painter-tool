"""
FastAPI mock service for AI Pipeline Editor
Provides node types with simulated network latency
"""
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Pipeline Node Service",
    description="Mock backend service providing node types for the pipeline editor",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/nodes")
async def get_nodes():
    """
    Get available node types for pipeline construction
    
    Returns:
        List of node types with id and name
    """
    # Simulate network latency
    await asyncio.sleep(1)
    
    return [
        {"id": "1", "name": "Data Source"},
        {"id": "2", "name": "Transformer"},
        {"id": "3", "name": "Model"},
        {"id": "4", "name": "Sink"}
    ]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-pipeline-node-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)