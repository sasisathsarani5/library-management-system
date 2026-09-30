from flask import Flask
from flask_cors import CORS
from app.routes.books import books_bp
from app.routes.users import users_bp
from app.routes.borrowings import borrowings_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(books_bp)
app.register_blueprint(users_bp)
app.register_blueprint(borrowings_bp)

@app.route('/')
def home():
    return {"message": "Library Management System API is running!"}

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)