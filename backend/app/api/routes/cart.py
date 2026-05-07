from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.cart import CartResponse, AddToCartRequest, UpdateCartItemRequest
from app.services.cart_service import CartService

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("/", response_model=CartResponse)
async def get_cart(
    session_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    cart = await service.get_or_create_cart_response(session_id)
    return cart


@router.post("/", response_model=CartResponse, status_code=201)
async def add_to_cart(
    request: AddToCartRequest,
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.add_to_cart(
        session_id=request.session_id,
        product_id=request.product_id,
        quantity=request.quantity,
    )


# /clear/ MUST be defined before /{item_id}/ to prevent path conflict
@router.delete("/clear/")
async def clear_cart(
    session_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    await service.clear_cart(session_id)
    return {"message": "Cart cleared successfully"}


@router.put("/{item_id}/", response_model=CartResponse)
async def update_cart_item(
    item_id: int,
    request: UpdateCartItemRequest,
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.update_cart_item(
        item_id=item_id,
        session_id=request.session_id,
        quantity=request.quantity,
    )


@router.delete("/{item_id}/", response_model=CartResponse)
async def remove_cart_item(
    item_id: int,
    session_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    service = CartService(db)
    return await service.remove_cart_item(item_id=item_id, session_id=session_id)
