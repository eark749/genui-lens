from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import views, events, summary, debug, sessions, projects


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="GenUI Lens API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(views.router)
app.include_router(events.router)
app.include_router(summary.router)
app.include_router(debug.router)
app.include_router(sessions.router)
app.include_router(projects.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
