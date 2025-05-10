# backend/app/models.py
# -*- coding: utf-8 -*-
from . import db # Import db from the app package's __init__.py
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import uuid
from typing import Dict, Any, Optional, List # For type hinting
from sqlalchemy.orm import Mapped, mapped_column, relationship # Import Mapped and relationship

# Note: For SQLAlchemy 2.0 style, db.Column is often replaced by mapped_column,
# and type hints become the primary way to define column types.
# We'll use Mapped for relationships and keep db.Column for columns for now for clarity,
# but fully embracing mapped_column with type hints is the more modern SQLAlchemy 2.0 style.

class BeeperModel(db.Model):
    """Model for beeper types/models available in the shop."""
    __tablename__ = 'beeper_models'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = db.Column(db.String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = db.Column(db.String(255), nullable=True)
    price: Mapped[float] = db.Column(db.Float, nullable=False)
    image_url: Mapped[Optional[str]] = db.Column(db.String(255), nullable=True)

    # Relationships
    # Use Mapped[List["ClassName"]] for collections
    sold_beepers: Mapped[List["SoldBeeper"]] = relationship(back_populates='model_info', lazy='dynamic')
    favorited_by_ops: Mapped[List["OperatorFavorite"]] = relationship(back_populates='model_info', lazy='dynamic')
    cart_items_ref: Mapped[List["CartItem"]] = relationship(back_populates='model_info', lazy='dynamic')

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'image_url': self.image_url
        }

class SoldBeeper(db.Model):
    """Model for individual beeper units that have been 'sold'."""
    __tablename__ = 'sold_beepers'
    id: Mapped[str] = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('beeper_models.id'), nullable=False)
    purchase_timestamp: Mapped[datetime.datetime] = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    status: Mapped[str] = db.Column(db.String(20), nullable=False, default='active')
    user_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationship to BeeperModel (Many-to-One)
    model_info: Mapped["BeeperModel"] = relationship(back_populates='sold_beepers')
    # Relationship to User (Many-to-One)
    purchasing_user: Mapped["User"] = relationship(back_populates='sold_beepers')


    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'model_id': self.model_id,
            'model_name': self.model_info.name if self.model_info else 'Unknown Model',
            'purchase_timestamp': self.purchase_timestamp.isoformat() if self.purchase_timestamp else None,
            'status': self.status,
            'user_id': self.user_id
        }

class User(db.Model):
    """Model for registered shop users."""
    __tablename__ = 'users'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = db.Column(db.String(80), unique=True, nullable=False)
    email: Mapped[str] = db.Column(db.String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = db.Column(db.String(256), nullable=False)
    created_at: Mapped[datetime.datetime] = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    sold_beepers: Mapped[List["SoldBeeper"]] = relationship(back_populates='purchasing_user', lazy='dynamic')
    cart_items: Mapped[List["CartItem"]] = relationship(back_populates='user_cart_owner', lazy='dynamic', cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Operator(db.Model):
    """Model for Ops Center operators."""
    __tablename__ = 'operators'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = db.Column(db.String(80), unique=True, nullable=False)
    password_hash: Mapped[str] = db.Column(db.String(256), nullable=False)

    favorites: Mapped[List["OperatorFavorite"]] = relationship(back_populates='operator_info', lazy='dynamic', cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'username': self.username
        }

class CartItem(db.Model):
    """Model for items in a user's shopping cart."""
    __tablename__ = 'cart_items'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    model_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('beeper_models.id'), nullable=False)
    quantity: Mapped[int] = db.Column(db.Integer, nullable=False, default=1)
    added_at: Mapped[datetime.datetime] = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    user_cart_owner: Mapped["User"] = relationship(back_populates='cart_items')
    model_info: Mapped["BeeperModel"] = relationship(back_populates='cart_items_ref')


    __table_args__ = (db.UniqueConstraint('user_id', 'model_id', name='_user_model_cart_uc'),)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'cart_item_id': self.id,
            'user_id': self.user_id,
            'model_id': self.model_id,
            'quantity': self.quantity,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'model_details': self.model_info.to_dict() if self.model_info else None
        }

class OperatorFavorite(db.Model):
    """Association table for operator's favorite beeper models."""
    __tablename__ = 'operator_favorites'
    id: Mapped[int] = db.Column(db.Integer, primary_key=True, autoincrement=True)
    operator_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('operators.id'), nullable=False)
    model_id: Mapped[int] = db.Column(db.Integer, db.ForeignKey('beeper_models.id'), nullable=False)

    # Relationships
    operator_info: Mapped["Operator"] = relationship(back_populates='favorites')
    model_info: Mapped["BeeperModel"] = relationship(back_populates='favorited_by_ops')

    __table_args__ = (db.UniqueConstraint('operator_id', 'model_id', name='_operator_model_favorite_uc'),)

