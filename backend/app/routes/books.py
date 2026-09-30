from flask import Blueprint, request, jsonify
from app.db import get_db_connection

books_bp = Blueprint('books', __name__)

@books_bp.route('/api/books', methods=['GET'])
def get_books():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM books")
        books = cursor.fetchall()
        conn.close()
        return jsonify(books), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@books_bp.route('/api/books', methods=['POST'])
def add_book():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO books (title, isbn, total_copies, available_copies)
            VALUES (%s, %s, %s, %s)
        """, (data['title'], data['isbn'], data['quantity'], data['quantity']))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Book added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500