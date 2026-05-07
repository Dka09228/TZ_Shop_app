from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartResponse, CartItemResponse, CartProductInfo


class CartService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _load_cart(self, session_id: str) -> Cart | None:
        result = await self.db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .where(Cart.session_id == session_id)
        )
        return result.scalar_one_or_none()

    def _to_response(self, cart: Cart) -> CartResponse:
        total = Decimal("0.00")
        items = []
        for item in cart.items:
            subtotal = item.product.price * item.quantity
            total += subtotal
            items.append(
                CartItemResponse(
                    id=item.id,
                    product=CartProductInfo(
                        id=item.product.id,
                        name=item.product.name,
                        price=item.product.price,
                        image=item.product.image,
                        category=item.product.category,
                    ),
                    quantity=item.quantity,
                    subtotal=subtotal,
                )
            )
        return CartResponse(id=cart.id, session_id=cart.session_id, items=items, total=total)

    async def get_or_create_cart_response(self, session_id: str) -> CartResponse:
        cart = await self._load_cart(session_id)
        if not cart:
            cart = Cart(session_id=session_id)
            self.db.add(cart)
            await self.db.commit()
            cart = await self._load_cart(session_id)
        return self._to_response(cart)  # type: ignore[arg-type]

    async def add_to_cart(self, session_id: str, product_id: int, quantity: int) -> CartResponse:
        product_result = await self.db.execute(select(Product).where(Product.id == product_id))
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        cart = await self._load_cart(session_id)
        if not cart:
            cart = Cart(session_id=session_id)
            self.db.add(cart)
            await self.db.flush()
            # cart.id is now set; cart.items is still the empty list from initialization

        existing = next((i for i in cart.items if i.product_id == product_id), None)

        if existing:
            new_qty = existing.quantity + quantity
            if new_qty > product.stock:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {product.stock} items in stock",
                )
            existing.quantity = new_qty
        else:
            if quantity > product.stock:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {product.stock} items in stock",
                )
            self.db.add(CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity))

        await self.db.commit()
        cart = await self._load_cart(session_id)
        return self._to_response(cart)  # type: ignore[arg-type]

    async def update_cart_item(self, item_id: int, session_id: str, quantity: int) -> CartResponse:
        cart = await self._load_cart(session_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        item = next((i for i in cart.items if i.id == item_id), None)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        if quantity > item.product.stock:
            raise HTTPException(status_code=400, detail=f"Only {item.product.stock} items in stock")

        item.quantity = quantity
        await self.db.commit()
        cart = await self._load_cart(session_id)
        return self._to_response(cart)  # type: ignore[arg-type]

    async def remove_cart_item(self, item_id: int, session_id: str) -> CartResponse:
        cart = await self._load_cart(session_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        item = next((i for i in cart.items if i.id == item_id), None)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        await self.db.delete(item)
        await self.db.commit()
        cart = await self._load_cart(session_id)
        return self._to_response(cart)  # type: ignore[arg-type]

    async def clear_cart(self, session_id: str) -> None:
        cart = await self._load_cart(session_id)
        if not cart:
            return
        for item in cart.items:
            await self.db.delete(item)
        await self.db.commit()
