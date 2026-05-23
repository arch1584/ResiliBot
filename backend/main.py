from fastapi import FastAPI
from app.routes import router as api_router

app = FastAPI(title="ResiliBot API")

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)