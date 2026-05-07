from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import products, cart
from app.core.config import settings

app = FastAPI(
    title="Product Catalog API",
    description="Interactive Product Catalog REST API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(cart.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
