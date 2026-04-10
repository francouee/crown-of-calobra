# AI Coding Guidelines
## What This Repo Is

An app that is a replicating the cycling race between friends in Mallorca layout with a minimalist design.

I want to have a main page thats shows all stages with GPS track overview as well as total distance and elevation and if the stage is mountain, plat or hilly. When I click on the stage I have a summary of the stage with detailed information.

## Testing

```bash
# From repo root — run after any change to the template or cookiecutter.json
uv run pytest -v .
```

## Conventions

| Topic | Convention |
|---|---|
| Python | ≥ 3.12 |
| Package manager | `uv` only |
| Linting / formatting | `ruff` |
| Type checking | `mypy` strict |
| Branch | `main` |
| frontend  | React, d3js |
| backend  | fastapi |
