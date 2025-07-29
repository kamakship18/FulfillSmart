# FastAPI app entrypoint
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import simulate, summary, analytics, blueprint, data

app = FastAPI(title="FulfillSmart API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router, prefix="/api")
app.include_router(summary.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(blueprint.router, prefix="/api/blueprint")
app.include_router(data.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "FulfillSmart API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
