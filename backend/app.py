# backend/app.py
# -*- coding: utf-8 -*-

import os
from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import uuid # לטובת יצירת ID ייחודי לביפרים שנמכרו

# --- הגדרות האפליקציה ---
app = Flask(__name__)
# מאפשר גישה מ-Frontend שרץ בדומיין אחר (localhost:port אחר)
# הגדרות CORS מחמירות יותר מומלצות לסביבת Production
CORS(app, resources={r"/api/*": {"origins": "*"}}) # אפשר לצמצם ל-origin של ה-Frontend

# הגדרת חיבור למסד הנתונים PostgreSQL
# !!! חשוב: שנה את ה-URI בהתאם להגדרות ה-PostgreSQL המקומיות שלך !!!
# פורמט: postgresql://[user]:[password]@[host]:[port]/[database_name]
# דוגמה: postgresql://user:password@localhost:5432/strategic_beep_db
db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'qwer1234') # החלף בסיסמה שלך
db_host = os.environ.get('DB_HOST', 'localhost')
db_port = os.environ.get('DB_PORT', '5432')
db_name = os.environ.get('DB_NAME', 'strategic_beep_db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- מודלים של מסד הנתונים (מומלץ להעביר לקובץ נפרד models.py) ---

class BeeperModel(db.Model):
    """מודל עבור דגמי ביפרים"""
    __tablename__ = 'beeper_models'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200))
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255)) # הוגדל האורך ליתר ביטחון

    sold_beepers = db.relationship('SoldBeeper', backref='model', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'image_url': self.image_url
        }

class SoldBeeper(db.Model):
    """מודל עבור ביפרים שנמכרו"""
    __tablename__ = 'sold_beepers'
    # UUID ייחודי לכל ביפר
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = db.Column(db.Integer, db.ForeignKey('beeper_models.id'), nullable=False)
    purchase_timestamp = db.Column(db.DateTime, default=datetime.datetime.now(datetime.timezone.utc)) # שימוש ב-timezone aware
    status = db.Column(db.String(20), nullable=False, default='active') # 'active' or 'activated'
    # ניתן להוסיף שדות נוספים כמו פרטי ה"רוכש" או מיקום משוער (לסימולציה)
    owner_identifier = db.Column(db.String(100), nullable=True) # לדוגמה, מזהה כלשהו של הרוכש

    def to_dict(self):
        return {
            'id': self.id,
            'model_id': self.model_id,
            'model_name': self.model.name if self.model else 'Unknown', # מציג גם את שם הדגם
            'purchase_timestamp': self.purchase_timestamp.isoformat(),
            'status': self.status,
            'owner_identifier': self.owner_identifier
        }

class Operator(db.Model):
    """מודל עבור מפעילי מרכז הבקרה (לצורך הזדהות)"""
    __tablename__ = 'operators'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    # --- שינוי כאן: הגדלת האורך ל-256 ---
    password_hash = db.Column(db.String(256), nullable=False)

    # הגדרת הקשר למועדפים עם cascade delete
    favorites = db.relationship('UserFavorite', backref='operator', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        # שימוש בשיטת hash מודרנית יותר אם זמינה בגרסת Werkzeug שלך
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class UserFavorite(db.Model):
    """מודל לקישור בין מפעיל לדגמים מועדפים"""
    __tablename__ = 'user_favorites'
    id = db.Column(db.Integer, primary_key=True)
    operator_id = db.Column(db.Integer, db.ForeignKey('operators.id'), nullable=False)
    model_id = db.Column(db.Integer, db.ForeignKey('beeper_models.id'), nullable=False)

    # אילוץ ייחודיות למניעת הוספת אותו מועדף פעמיים לאותו משתמש
    __table_args__ = (db.UniqueConstraint('operator_id', 'model_id', name='_operator_model_uc'),)

# --- פונקציית עזר להזדהות (דוגמה בסיסית עם Basic Auth) ---
# ביישום אמיתי, מומלץ להשתמש בספריות כמו Flask-Login או JWT לניהול session/token
def authenticate_operator(username, password):
    """בודק אם שם המשתמש והסיסמה תואמים למפעיל קיים"""
    op = Operator.query.filter_by(username=username).first()
    if op and op.check_password(password):
        return op
    return None

def get_authenticated_operator():
    """
    פונקציה לדוגמה לקבלת המפעיל המאומת באמצעות Basic Auth.
    זהו מנגנון פשוט ולא המאובטח ביותר ל-Production.
    """
    auth = request.authorization
    if auth and auth.username and auth.password:
        return authenticate_operator(auth.username, auth.password)
    # אם אין Auth Header תקין, המשתמש לא מאומת
    return None

# --- Decorator לבדיקת הרשאות ---
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if get_authenticated_operator() is None:
            # שגיאת 401 Unauthorized
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- נקודות קצה (API Endpoints) ---

# Blueprint לחנות הציבורית
from flask import Blueprint
shop_bp = Blueprint('shop', __name__, url_prefix='/api/beepers')

@shop_bp.route('/models', methods=['GET'])
def get_beeper_models():
    """מחזיר את כל דגמי הביפרים הזמינים"""
    try:
        models = BeeperModel.query.all()
        return jsonify([model.to_dict() for model in models])
    except Exception as e:
        app.logger.error(f"Error fetching beeper models: {e}")
        return jsonify({"error": "Internal server error"}), 500

@shop_bp.route('/purchase', methods=['POST'])
def purchase_beepers():
    """רושם רכישה של ביפרים"""
    data = request.get_json()
    if not data or 'items' not in data or not isinstance(data['items'], list):
        return jsonify({"error": "Missing or invalid 'items' list in request body"}), 400

    purchased_beepers_info = []
    try:
        owner_id = f"customer_{uuid.uuid4().hex[:8]}" # יצירת מזהה דמה לרוכש

        for item in data['items']:
            model_id = item.get('model_id')
            quantity = item.get('quantity', 1)

            if not model_id or not isinstance(quantity, int) or quantity < 1:
                 # שימוש ב-logging במקום abort כדי לתת הודעה מפורטת יותר
                 app.logger.warning(f"Invalid item data received in purchase request: {item}")
                 return jsonify({"error": f"Invalid item data provided for model_id {model_id}"}), 400

            model = BeeperModel.query.get(model_id)
            if not model:
                 app.logger.warning(f"Attempted to purchase non-existent model_id: {model_id}")
                 return jsonify({"error": f"Beeper model with id {model_id} not found"}), 404

            for _ in range(quantity):
                # יצירת ביפר חדש עם מזהה הבעלים
                new_beeper = SoldBeeper(model_id=model_id, owner_identifier=owner_id)
                db.session.add(new_beeper)
                # Flush כדי לקבל את ה-ID שנוצר
                db.session.flush()
                purchased_beepers_info.append(new_beeper.to_dict())

        db.session.commit()
        return jsonify({"message": "Purchase successful", "purchased_beepers": purchased_beepers_info}), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error processing purchase: {e}")
        return jsonify({"error": "Internal server error during purchase processing"}), 500

# Blueprint למרכז הבקרה (מוגן)
ops_bp = Blueprint('ops', __name__, url_prefix='/api/operations')

@ops_bp.route('/login', methods=['POST'])
def operator_login():
    """מבצע הזדהות למפעיל (לא דורש login_required כי זו הכניסה)"""
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({"error": "Basic Authentication required"}), 401 # דורש Basic Auth

    operator = authenticate_operator(auth.username, auth.password)
    if operator:
        # ביישום אמיתי, כאן נייצר טוקן/ננהל session
        app.logger.info(f"Operator '{operator.username}' logged in successfully.")
        return jsonify({"message": "Login successful", "operator_id": operator.id}), 200
    else:
        app.logger.warning(f"Failed login attempt for username: {auth.username}")
        return jsonify({"error": "Invalid credentials"}), 401

# --- נקודות קצה מוגנות ---

@ops_bp.route('/favorites', methods=['GET'])
@login_required
def get_favorites():
    """מחזיר את המועדפים של המשתמש המאומת"""
    operator = get_authenticated_operator() # ה-decorator מבטיח שהוא לא None
    try:
        favorites = UserFavorite.query.filter_by(operator_id=operator.id).all()
        favorite_model_ids = [fav.model_id for fav in favorites]
        return jsonify(favorite_model_ids)
    except Exception as e:
        app.logger.error(f"Error fetching favorites for operator {operator.id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@ops_bp.route('/favorites/<int:model_id>', methods=['POST'])
@login_required
def add_favorite(model_id):
    """מוסיף דגם למועדפים של המשתמש המאומת"""
    operator = get_authenticated_operator()
    model = BeeperModel.query.get(model_id)
    if not model:
        return jsonify({"error": f"Beeper model with id {model_id} not found"}), 404

    existing = UserFavorite.query.filter_by(operator_id=operator.id, model_id=model_id).first()
    if existing:
        return jsonify({"message": "Model already in favorites"}), 200

    try:
        new_favorite = UserFavorite(operator_id=operator.id, model_id=model_id)
        db.session.add(new_favorite)
        db.session.commit()
        app.logger.info(f"Operator {operator.username} added model {model_id} to favorites.")
        return jsonify({"message": "Model added to favorites"}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error adding favorite for operator {operator.id}, model {model_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@ops_bp.route('/favorites/<int:model_id>', methods=['DELETE'])
@login_required
def remove_favorite(model_id):
    """מסיר דגם מהמועדפים של המשתמש המאומת"""
    operator = get_authenticated_operator()
    try:
        favorite_to_delete = UserFavorite.query.filter_by(operator_id=operator.id, model_id=model_id).first()
        if favorite_to_delete:
            db.session.delete(favorite_to_delete)
            db.session.commit()
            app.logger.info(f"Operator {operator.username} removed model {model_id} from favorites.")
            return jsonify({"message": "Model removed from favorites"}), 200
        else:
            return jsonify({"error": "Favorite not found"}), 404
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error removing favorite for operator {operator.id}, model {model_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@ops_bp.route('/beepers', methods=['GET'])
@login_required
def get_sold_beepers():
    """מחזיר את כל הביפרים שנמכרו (מוגן)"""
    operator = get_authenticated_operator() # רק לוודא שהוא קיים
    try:
        sold_beepers_query = db.session.query(SoldBeeper, BeeperModel.name)\
                                 .join(BeeperModel, SoldBeeper.model_id == BeeperModel.id)\
                                 .order_by(SoldBeeper.purchase_timestamp.desc())

        # --- הוספת אפשרויות סינון (דוגמה) ---
        status_filter = request.args.get('status')
        model_filter = request.args.get('model_id')

        if status_filter:
            sold_beepers_query = sold_beepers_query.filter(SoldBeeper.status == status_filter)
        if model_filter:
            try:
                model_id_int = int(model_filter)
                sold_beepers_query = sold_beepers_query.filter(SoldBeeper.model_id == model_id_int)
            except ValueError:
                return jsonify({"error": "Invalid model_id format for filtering"}), 400
        # --- סוף הוספת סינון ---

        sold_beepers = sold_beepers_query.all()

        result = []
        for beeper, model_name in sold_beepers:
            beeper_dict = beeper.to_dict()
            beeper_dict['model_name'] = model_name
            result.append(beeper_dict)

        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error fetching sold beepers: {e}")
        return jsonify({"error": "Internal server error"}), 500

@ops_bp.route('/beepers/activate', methods=['POST'])
@login_required
def activate_beepers():
    """מפעיל ביפרים נבחרים (מוגן)"""
    operator = get_authenticated_operator()
    data = request.get_json()
    if not data or 'beeper_ids' not in data or not isinstance(data['beeper_ids'], list):
        return jsonify({"error": "Missing or invalid 'beeper_ids' list in request body"}), 400

    beeper_ids_to_activate = data['beeper_ids']
    activated_count = 0
    errors = []
    activated_ids = []

    try:
        # אופטימיזציה: שליפה של כל הביפרים הרלוונטיים בפעם אחת
        beepers_to_check = SoldBeeper.query.filter(SoldBeeper.id.in_(beeper_ids_to_activate)).all()
        beepers_dict = {beeper.id: beeper for beeper in beepers_to_check}

        for beeper_id in beeper_ids_to_activate:
            beeper = beepers_dict.get(beeper_id)
            if not beeper:
                errors.append(f"Beeper with id {beeper_id} not found.")
            elif beeper.status == 'activated':
                errors.append(f"Beeper with id {beeper_id} is already activated.")
            elif beeper.status == 'active':
                beeper.status = 'activated'
                activated_count += 1
                activated_ids.append(beeper_id)
            else:
                # סטטוס לא צפוי
                 errors.append(f"Beeper with id {beeper_id} has an unexpected status: {beeper.status}")


        if activated_count > 0:
             db.session.commit()
             app.logger.info(f"Operator {operator.username} activated {activated_count} beepers: {activated_ids}")


        response = {
            "message": f"Activation process completed. {activated_count} beepers activated.",
            "errors": errors if errors else None
        }
        # אם היו שגיאות כלשהן (לא נמצא, כבר הופעל וכו') נחזיר 400
        status_code = 200 if not errors else 400
        return jsonify(response), status_code

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error activating beepers: {e}")
        return jsonify({"error": "Internal server error during activation"}), 500

# רישום ה-Blueprints באפליקציה
app.register_blueprint(shop_bp)
app.register_blueprint(ops_bp)

# --- פונקציות עזר להקמת DB ונתוני דמה ---
def create_initial_data():
    """יוצר טבלאות ומוסיף נתוני דמה אם ה-DB ריק"""
    with app.app_context():
        print("Attempting to create database tables...")
        try:
            db.create_all() # יוצר את הטבלאות אם לא קיימות
            print("Tables created (or already exist).")
        except Exception as e:
            print(f"Error creating tables: {e}")
            # אפשר להחליט אם להמשיך או לעצור כאן
            return # עצירה אם יצירת הטבלאות נכשלה

        # הוספת מפעיל דמה (רק אם אין מפעילים בכלל)
        if Operator.query.count() == 0:
            print("Creating default operator...")
            try:
                op = Operator(username='admin')
                # ודא שהסיסמה לא יוצרת hash ארוך מדי
                op.set_password('password')
                db.session.add(op)
                db.session.commit()
                print("Default operator created (username='admin', password='password')")
            except Exception as e:
                db.session.rollback()
                print(f"Error creating default operator: {e}")


        # הוספת דגמי ביפרים דמה (רק אם אין דגמים בכלל)
        if BeeperModel.query.count() == 0:
            print("Creating dummy beeper models...")
            try:
                models_data = [
                    {'name': 'PagerOne Basic', 'description': 'The reliable classic for everyday use.', 'price': 49.99, 'image_url': 'https://placehold.co/300x200/7B3F00/FFF?text=PagerOne'},
                    {'name': 'PagerX Pro', 'description': 'Advanced features, encryption, long range.', 'price': 99.99, 'image_url': 'https://placehold.co/300x200/00008B/FFF?text=PagerX'},
                    {'name': 'StealthPager Mini', 'description': 'Compact, discreet, silent mode available.', 'price': 75.50, 'image_url': 'https://placehold.co/300x200/2F4F4F/FFF?text=StealthPager'},
                    {'name': 'RuggedPager 5000', 'description': 'Waterproof, shock resistant, built for field work.', 'price': 120.00, 'image_url': 'https://placehold.co/300x200/8B4513/FFF?text=RuggedPager'},
                     {'name': 'MediPager Alert', 'description': 'Designed for medical emergency notifications.', 'price': 85.00, 'image_url': 'https://placehold.co/300x200/DC143C/FFF?text=MediPager'}
                ]
                for data in models_data:
                    model = BeeperModel(**data)
                    db.session.add(model)
                db.session.commit()
                print(f"{len(models_data)} dummy models created.")
            except Exception as e:
                db.session.rollback()
                print(f"Error creating dummy models: {e}")

# --- הרצת האפליקציה ---
if __name__ == '__main__':
    # קריאה לפונקציה ליצירת טבלאות ונתוני דמה רק אם מריצים את הקובץ ישירות
    create_initial_data()
    # הרצה על פורט שונה מפורט ברירת המחדל של React, ונגיש מכל הרשת
    app.run(host='0.0.0.0', port=5001, debug=True)

# backend/models.py
# -*- coding: utf-8 -*-

# כפי שצוין קודם, מומלץ להעביר את הגדרות המודלים לכאן בפרויקט גדול.
# הקוד הנוכחי משאיר אותם ב-app.py.
pass
