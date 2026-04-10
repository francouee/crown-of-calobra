from pydantic import BaseModel


class TrackPoint(BaseModel):
    lat: float
    lon: float
    ele: float


class Stage(BaseModel):
    id: int
    name: str
    subtitle: str
    distance_km: float
    elevation_gain_m: int
    terrain: str  # "mountain" | "hilly" | "flat"
    start: str
    finish: str
    description: str
    track: list[TrackPoint]
