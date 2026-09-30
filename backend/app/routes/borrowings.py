from flask import Blueprint, request, jsonify
from app.db import get_db_connection
from datetime import datetime, timedelta

borrowings_bp = Blueprint('borrowings', __name__)

# Fetch all borrowing records
@borrowings_bp.route('/api/borrowings', methods=['GET'])
def get_borrowings():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT b.borrow_id, u.name as user_name, k.title as book_title, 
                   b.issue_date, b.due_date, b.return_date, b.status, b.fine
            FROM borrowings b
            JOIN users u ON b.user_id = u.user_id
            JOIN books k ON b.book_id = k.book_id
            ORDER BY b.borrow_id DESC
        """
        cursor.execute(query)
        records = cursor.fetchall()
        conn.close()
        return jsonify(records), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Issue (Borrow) a Book with MySQL Transaction
@borrowings_bp.route('/api/borrowings/issue', methods=['POST'])
def issue_book():
    data = request.json
    user_id = data.get('user_id')
    book_id = data.get('book_id')
    days = data.get('days', 14)

    if not user_id or not book_id:
        return jsonify({'error': 'User ID and Book ID are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Start Transaction
        conn.begin()

        # 1. Check if book exists and has available copies
        cursor.execute("SELECT available_copies FROM books WHERE book_id = %s FOR UPDATE", (book_id,))
        book = cursor.fetchone()

        if not book:
            conn.rollback()
            return jsonify({'error': 'Book not found'}), 404

        if book['available_copies'] < 1:
            conn.rollback()
            return jsonify({'error': 'No available copies left for this book'}), 400

        # 2. Decrement available copies
        cursor.execute("UPDATE books SET available_copies = available_copies - 1 WHERE book_id = %s", (book_id,))

        # 3. Create borrowing record
        issue_date = datetime.now().date()
        due_date = issue_date + timedelta(days=int(days))

        cursor.execute("""
            INSERT INTO borrowings (user_id, book_id, issue_date, due_date, status)
            VALUES (%s, %s, %s, %s, 'BORROWED')
        """, (user_id, book_id, issue_date, due_date))

        # Commit Transaction
        conn.commit()
        conn.close()
        return jsonify({'message': 'Book issued successfully'}), 201

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500


# Return a Book with MySQL Transaction
@borrowings_bp.route('/api/borrowings/return', methods=['POST'])
def return_book():
    data = request.json
    borrow_id = data.get('borrow_id')

    if not borrow_id:
        return jsonify({'error': 'Borrow ID is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Start Transaction
        conn.begin()

        # 1. Check borrowing status
        cursor.execute("SELECT book_id, status, due_date FROM borrowings WHERE borrow_id = %s FOR UPDATE", (borrow_id,))
        record = cursor.fetchone()

        if not record:
            conn.rollback()
            return jsonify({'error': 'Borrow record not found'}), 404

        if record['status'] == 'RETURNED':
            conn.rollback()
            return jsonify({'error': 'Book has already been returned'}), 400

        # 2. Calculate fine if overdue ($1.00 per late day)
        return_date = datetime.now().date()
        due_date = record['due_date']
        fine = 0.00

        if return_date > due_date:
            overdue_days = (return_date - due_date).days
            fine = float(overdue_days * 1.00)

        # 3. Update borrowing record
        cursor.execute("""
            UPDATE borrowings 
            SET return_date = %s, status = 'RETURNED', fine = %s 
            WHERE borrow_id = %s
        """, (return_date, fine, borrow_id))

        # 4. Increment available book copies back
        cursor.execute("UPDATE books SET available_copies = available_copies + 1 WHERE book_id = %s", (record['book_id'],))

        # Commit Transaction
        conn.commit()
        conn.close()
        return jsonify({'message': 'Book returned successfully', 'fine': fine}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500