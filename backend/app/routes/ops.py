# backend/app/routes/ops.py
# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify, current_app
from ..models import SoldBeeper, BeeperModel, Operator, OperatorFavorite
from .. import db
from ..utils.auth_helpers import operator_basic_auth_required # Using Basic Auth for operator

ops_bp = Blueprint('ops', __name__, url_prefix='/api/ops')

# Operator login is handled by /api/auth/login/operator

@ops_bp.route('/beepers', methods=['GET'])
@operator_basic_auth_required # Operator must be logged in (sends Basic Auth header)
def get_sold_beepers_route(current_operator_obj: Operator): # Decorator injects current_operator_obj
    """Returns all sold beepers, with optional filtering."""
    try:
        query = db.session.query(SoldBeeper, BeeperModel.name.label("model_name"))\
            .join(BeeperModel, SoldBeeper.model_id == BeeperModel.id)

        # Filtering options
        status_filter = request.args.get('status')
        model_id_filter = request.args.get('model_id')
        user_id_filter = request.args.get('user_id') # Filter by purchasing user ID

        if status_filter:
            query = query.filter(SoldBeeper.status == status_filter)
        if model_id_filter:
            try:
                query = query.filter(SoldBeeper.model_id == int(model_id_filter))
            except ValueError:
                return jsonify({"error": "Invalid model_id format for filtering."}), 400
        if user_id_filter:
            try:
                query = query.filter(SoldBeeper.user_id == int(user_id_filter))
            except ValueError:
                return jsonify({"error": "Invalid user_id format for filtering."}), 400
        
        sold_beepers_with_model_name = query.order_by(SoldBeeper.purchase_timestamp.desc()).all()

        result = []
        for beeper, model_name_str in sold_beepers_with_model_name:
            beeper_dict = beeper.to_dict()
            beeper_dict['model_name'] = model_name_str
            result.append(beeper_dict)
        
        current_app.logger.info(f"Operator {current_operator_obj.username} fetched sold beepers list.")
        return jsonify(result)
    except Exception as e:
        current_app.logger.error(f"Error fetching sold beepers for operator {current_operator_obj.username}: {str(e)}")
        return jsonify({"error": "Internal server error fetching sold beepers."}), 500

@ops_bp.route('/beepers/activate', methods=['POST'])
@operator_basic_auth_required
def activate_beepers_route(current_operator_obj: Operator):
    """Activates selected beepers."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400
        
    beeper_ids_to_activate = data.get('beeper_ids')
    if not beeper_ids_to_activate or not isinstance(beeper_ids_to_activate, list):
        return jsonify({"error": "Missing or invalid 'beeper_ids' list in request body."}), 400
    
    if not beeper_ids_to_activate: # Empty list
        return jsonify({"message": "No beeper IDs provided for activation.", "activated_ids": [], "errors": None}), 200

    activated_count = 0
    errors_list = []
    successfully_activated_ids = []

    try:
        beepers_to_process = SoldBeeper.query.filter(SoldBeeper.id.in_(beeper_ids_to_activate)).all()
        beeper_map = {b.id: b for b in beepers_to_process}

        for beeper_id_str in beeper_ids_to_activate:
            beeper = beeper_map.get(str(beeper_id_str)) # Ensure ID is string for UUID comparison
            if not beeper:
                errors_list.append(f"Beeper with id {beeper_id_str} not found.")
            elif beeper.status == 'activated':
                errors_list.append(f"Beeper with id {beeper_id_str} is already activated.")
            elif beeper.status == 'active':
                beeper.status = 'activated'
                db.session.add(beeper)
                activated_count += 1
                successfully_activated_ids.append(beeper.id)
            else:
                errors_list.append(f"Beeper with id {beeper_id_str} has an unexpected status: {beeper.status}.")
        
        if activated_count > 0:
            db.session.commit()
            current_app.logger.info(f"Operator {current_operator_obj.username} activated {activated_count} beepers: {successfully_activated_ids}")
        else:
            db.session.rollback() # No actual changes to commit

        response_message = f"Activation process completed. {activated_count} beeper(s) newly activated."
        if errors_list:
            response_message += f" Encountered {len(errors_list)} issue(s)."

        return jsonify({
            "message": response_message,
            "activated_ids": successfully_activated_ids,
            "errors": errors_list if errors_list else None
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error activating beepers for operator {current_operator_obj.username}: {str(e)}")
        return jsonify({"error": "Internal server error during activation."}), 500

@ops_bp.route('/favorites', methods=['GET'])
@operator_basic_auth_required
def get_operator_favorites_route(current_operator_obj: Operator):
    """Returns the authenticated operator's favorite beeper model IDs."""
    try:
        favorites = OperatorFavorite.query.filter_by(operator_id=current_operator_obj.id).all()
        favorite_model_ids = [fav.model_id for fav in favorites]
        return jsonify(favorite_model_ids)
    except Exception as e:
        current_app.logger.error(f"Error fetching favorites for operator {current_operator_obj.username}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@ops_bp.route('/favorites/<int:model_id>', methods=['POST'])
@operator_basic_auth_required
def add_operator_favorite_route(current_operator_obj: Operator, model_id: int):
    """Adds a beeper model to the authenticated operator's favorites."""
    model = BeeperModel.query.get(model_id)
    if not model:
        return jsonify({"error": f"Beeper model with id {model_id} not found."}), 404

    existing = OperatorFavorite.query.filter_by(operator_id=current_operator_obj.id, model_id=model_id).first()
    if existing:
        return jsonify({"message": "Model already in favorites."}), 200

    try:
        new_favorite = OperatorFavorite(operator_id=current_operator_obj.id, model_id=model_id)
        db.session.add(new_favorite)
        db.session.commit()
        current_app.logger.info(f"Operator {current_operator_obj.username} added model {model_id} to favorites.")
        return jsonify({"message": "Model added to favorites."}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding favorite for operator {current_operator_obj.username}, model {model_id}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@ops_bp.route('/favorites/<int:model_id>', methods=['DELETE'])
@operator_basic_auth_required
def remove_operator_favorite_route(current_operator_obj: Operator, model_id: int):
    """Removes a beeper model from the authenticated operator's favorites."""
    try:
        favorite_to_delete = OperatorFavorite.query.filter_by(operator_id=current_operator_obj.id, model_id=model_id).first()
        if favorite_to_delete:
            db.session.delete(favorite_to_delete)
            db.session.commit()
            current_app.logger.info(f"Operator {current_operator_obj.username} removed model {model_id} from favorites.")
            return jsonify({"message": "Model removed from favorites."}), 200
        else:
            return jsonify({"error": "Favorite not found."}), 404
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error removing favorite for operator {current_operator_obj.username}, model {model_id}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
