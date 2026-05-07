from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.product import ProductListResponse, ProductResponse, SuggestionResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/categories/", response_model=list[str])
async def get_categories(db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_categories()


@router.get("/suggestions/", response_model=list[SuggestionResponse])
async def get_suggestions(
    search: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.get_suggestions(search)


@router.get("/", response_model=ProductListResponse)
async def list_products(
    search: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort_by: Literal["price", "name", "rating", "created_at"] | None = None,
    sort_order: Literal["asc", "desc"] = "asc",
    limit: int = Query(default=12, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.get_products(
        search=search,
        category=category,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=limit,
        offset=offset,
    )


@router.get("/{product_id}/", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
