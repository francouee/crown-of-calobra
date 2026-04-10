from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.data import STAGES
from app.models import Stage

app = FastAPI(title="Crown of Calobra API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/stages", response_model=list[Stage])
def get_stages() -> list[Stage]:
    return STAGES


@app.get("/api/stages/{stage_id}", response_model=Stage)
def get_stage(stage_id: int) -> Stage:
    for stage in STAGES:
        if stage.id == stage_id:
            return stage
    raise HTTPException(status_code=404, detail="Stage not found")
