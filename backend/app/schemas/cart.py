from decimal import Decimal
from pydantic import BaseModel, ConfigDict, field_validator


class CartProductInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: Decimal
    image: str | None = None
    category: str | None = None


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product: CartProductInfo
    quantity: int
    subtotal: Decimal


class CartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: str
    items: list[CartItemResponse]
    total: Decimal


class AddToCartRequest(BaseModel):
    session_id: str
    product_id: int
    quantity: int = 1

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v


class UpdateCartItemRequest(BaseModel):
    session_id: str
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v
