import os

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/userdb",
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    password = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
        }


def ensure_schema():
    inspector = inspect(db.engine)

    if "users" not in inspector.get_table_names():
        db.create_all()
        return

    columns = {column["name"] for column in inspector.get_columns("users")}

    if "password" not in columns:
        with db.engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '1234'"
                )
            )


def find_user_by_username(username):
    return User.query.filter_by(username=username).first()


with app.app_context():
    db.create_all()
    ensure_schema()


@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"message": "username, email and password are required"}), 400

    if find_user_by_username(username) is not None:
        return jsonify({"message": "Username already exists"}), 409

    user = User(username=username, email=email, password=password)
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.order_by(User.id.asc()).all()
    return jsonify([user.to_dict() for user in users]), 200


@app.route("/users/verify", methods=["POST"])
def verify_user():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "username and password are required"}), 400

    user = find_user_by_username(username)

    if user is None or user.password != password:
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify(user.to_dict()), 200


@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user.to_dict()), 200


@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json() or {}
    username = (data.get("username") or user.username).strip()
    email = (data.get("email") or user.email).strip()
    password = data.get("password") or user.password

    if not username or not email or not password:
        return jsonify({"message": "username, email and password are required"}), 400

    existing_user = find_user_by_username(username)
    if existing_user is not None and existing_user.id != user.id:
        return jsonify({"message": "Username already exists"}), 409

    user.username = username
    user.email = email
    user.password = password
    db.session.commit()

    return jsonify(user.to_dict()), 200


@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
