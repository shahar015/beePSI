# backend/app/routes/shop.py
# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify, current_app
from ..models import BeeperModel, SoldBeeper, CartItem, User
from .. import db
from ..utils.auth_helpers import user_basic_auth_required # Using Basic Auth for protected user routes
import uuid # For SoldBeeper ID generation

shop_bp = Blueprint('shop', __name__, url_prefix='/api/shop')

@shop_bp.route('/models', methods=['GET'])
def get_beeper_models_route():
    """Returns all available beeper models (public endpoint)."""
    try:
        models = BeeperModel.query.order_by(BeeperModel.name).all()
        return jsonify([model.to_dict() for model in models])
    except Exception as e:
        current_app.logger.error(f"Error fetching beeper models: {str(e)}")
        return jsonify({"error": "Internal server error fetching models."}), 500

# --- Cart Endpoints (Protected by user_basic_auth_required) ---

@shop_bp.route('/cart', methods=['GET'])
@user_basic_auth_required # User must be logged in (sends Basic Auth header)
def get_cart_route(current_user_obj: User): # Decorator injects current_user_obj
    """Gets the current authenticated user's cart."""
    try:
        cart_items = CartItem.query.filter_by(user_id=current_user_obj.id).order_by(CartItem.added_at).all()
        return jsonify([item.to_dict() for item in cart_items])
    except Exception as e:
        current_app.logger.error(f"Error fetching cart for user {current_user_obj.username}: {str(e)}")
        return jsonify({"error": "Failed to fetch cart."}), 500

@shop_bp.route('/cart/add', methods=['POST'])
@user_basic_auth_required
def add_to_cart_route(current_user_obj: User):
    """Adds an item to the current user's cart or increments quantity."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400

    model_id = data.get('model_id')
    quantity_to_add = data.get('quantity', 1)

    if not model_id or not isinstance(model_id, int) or not isinstance(quantity_to_add, int) or quantity_to_add < 1:
        return jsonify({"error": "Invalid 'model_id' (must be int) or 'quantity' (must be positive int)."}), 400

    beeper_model_exists = BeeperModel.query.get(model_id)
    if not beeper_model_exists:
        return jsonify({"error": f"Beeper model with id {model_id} not found."}), 404

    try:
        cart_item = CartItem.query.filter_by(user_id=current_user_obj.id, model_id=model_id).first()
        if cart_item:
            cart_item.quantity += quantity_to_add
        else:
            cart_item = CartItem(user_id=current_user_obj.id, model_id=model_id, quantity=quantity_to_add)
            db.session.add(cart_item)
        
        db.session.commit()
        current_app.logger.info(f"User {current_user_obj.username} updated cart for model {model_id}.")
        # Return the updated cart item
        return jsonify(cart_item.to_dict()), 200 # 200 OK for update, 201 if always new
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding to cart for user {current_user_obj.username}: {str(e)}")
        return jsonify({"error": "Failed to add item to cart."}), 500

@shop_bp.route('/cart/item/<int:model_id>', methods=['PUT'])
@user_basic_auth_required
def update_cart_item_quantity_route(current_user_obj: User, model_id: int):
    """Updates the quantity of a specific item in the user's cart. Set quantity to 0 to remove."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400
        
    new_quantity = data.get('quantity')

    if not isinstance(new_quantity, int) or new_quantity < 0:
        return jsonify({"error": "Invalid 'quantity'. Must be a non-negative integer."}), 400

    try:
        cart_item = CartItem.query.filter_by(user_id=current_user_obj.id, model_id=model_id).first()
        if not cart_item:
            return jsonify({"error": "Item not found in cart."}), 404

        if new_quantity == 0:
            db.session.delete(cart_item)
            current_app.logger.info(f"User {current_user_obj.username} removed model {model_id} from cart (quantity set to 0).")
            db.session.commit()
            return jsonify({"message": f"Item model {model_id} removed from cart."}), 200
        else:
            cart_item.quantity = new_quantity
            db.session.commit()
            current_app.logger.info(f"User {current_user_obj.username} updated quantity for model {model_id} to {new_quantity}.")
            return jsonify(cart_item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating cart quantity for user {current_user_obj.username}: {str(e)}")
        return jsonify({"error": "Failed to update cart item quantity."}), 500

@shop_bp.route('/cart/item/<int:model_id>', methods=['DELETE'])
@user_basic_auth_required
def remove_from_cart_route(current_user_obj: User, model_id: int):
    """Removes an item completely from the user's cart, regardless of quantity."""
    try:
        cart_item = CartItem.query.filter_by(user_id=current_user_obj.id, model_id=model_id).first()
        if cart_item:
            db.session.delete(cart_item)
            db.session.commit()
            current_app.logger.info(f"User {current_user_obj.username} explicitly removed model {model_id} from cart.")
            return jsonify({"message": "Item removed from cart successfully."}), 200
        else:
            return jsonify({"error": "Item not found in cart."}), 404
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error removing from cart for user {current_user_obj.username}: {str(e)}")
        return jsonify({"error": "Failed to remove item from cart."}), 500

@shop_bp.route('/purchase', methods=['POST'])
@user_basic_auth_required
def purchase_beepers_route(current_user_obj: User):
    """
    Processes the purchase of items currently in the user's cart.
    Creates SoldBeeper records and then clears the user's cart.
    """
    user_cart_items = CartItem.query.filter_by(user_id=current_user_obj.id).all()

    if not user_cart_items:
        return jsonify({"error": "Your cart is empty. Nothing to purchase."}), 400

    purchased_beepers_info = []
    try:
        for cart_item_db in user_cart_items:
            for _ in range(cart_item_db.quantity):
                new_sold_beeper = SoldBeeper(
                    model_id=cart_item_db.model_id,
                    user_id=current_user_obj.id
                )
                db.session.add(new_sold_beeper)
                # We need to flush to get the ID if we want to return it immediately,
                # but it's safer to commit once at the end.
                # If returning detailed info of each sold beeper, flush might be needed here.
            
            # Remove item from cart after processing for purchase
            db.session.delete(cart_item_db)

        db.session.commit() # Commit all sold beepers and cart deletions together
        
        # Fetch the newly created SoldBeeper objects to return their details
        # This is a bit inefficient but ensures we return the generated IDs and timestamps
        # A more optimized way might involve collecting IDs during creation if needed.
        # For now, let's just confirm the count.
        # To get details, you'd query SoldBeeper for this user from this transaction.
        # This part is simplified to avoid complex queries post-commit for this example.

        current_app.logger.info(f"User {current_user_obj.username} completed purchase of items from cart.")
        # Ideally, you'd return the list of 'SoldBeeper' objects created.
        # For simplicity, we'll return a success message.
        # To return purchased_beepers_info, you'd need to .to_dict() them *after* commit or flush carefully.
        return jsonify({
            "message": "Purchase successful! Your beepers are 'on their way'. Cart has been cleared.",
            "items_purchased_count": len(user_cart_items) # This is count of cart entries, not total beeper units
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error processing purchase for user {current_user_obj.username}: {str(e)}")
        return jsonify({"error": "Internal server error during purchase processing."}), 500
