import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { Book, User, Borrowing } from './types';

const BOOKS_API = 'http://127.0.0.1:5000/api/books';
const USERS_API = 'http://127.0.0.1:5000/api/users';
const BORROW_API = 'http://127.0.0.1:5000/api/borrowings';

export default function App() {
  const [activeTab, setActiveTab] = useState<'books' | 'users' | 'borrow'>('books');

  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);

  // Form Inputs
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [days, setDays] = useState<number>(14);

  const [loading, setLoading] = useState(false);

  // Fetch Data
  const loadAllData = async () => {
    try {
      const [resBooks, resUsers, resBorrowings] = await Promise.all([
        axios.get(BOOKS_API),
        axios.get(USERS_API),
        axios.get(BORROW_API)
      ]);
      if (Array.isArray(resBooks.data)) setBooks(resBooks.data);
      if (Array.isArray(resUsers.data)) setUsers(resUsers.data);
      if (Array.isArray(resBorrowings.data)) setBorrowings(resBorrowings.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedBook) return alert('Select both a user and a book');
    setLoading(true);
    try {
      await axios.post(`${BORROW_API}/issue`, {
        user_id: Number(selectedUser),
        book_id: Number(selectedBook),
        days: Number(days)
      });
      setSelectedBook('');
      setSelectedUser('');
      loadAllData();
      alert('Book issued successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (borrow_id: number) => {
    if (!confirm('Mark this book as returned?')) return;
    try {
      const res = await axios.post(`${BORROW_API}/return`, { borrow_id });
      alert(`Book returned! ${res.data.fine > 0 ? `Late fine: $${res.data.fine}` : 'No fine incurred.'}`);
      loadAllData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to return book');
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>📚 Library Management System</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('books')} style={{ padding: '10px 18px', background: activeTab === 'books' ? '#2563eb' : '#e4e4e7', color: activeTab === 'books' ? '#fff' : '#000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          📖 Books
        </button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '10px 18px', background: activeTab === 'users' ? '#2563eb' : '#e4e4e7', color: activeTab === 'users' ? '#fff' : '#000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          👥 Members
        </button>
        <button onClick={() => setActiveTab('borrow')} style={{ padding: '10px 18px', background: activeTab === 'borrow' ? '#2563eb' : '#e4e4e7', color: activeTab === 'borrow' ? '#fff' : '#000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          🔄 Borrow & Return
        </button>
      </div>

      {/* BORROW TAB */}
      {activeTab === 'borrow' && (
        <div>
          {/* Issue Form */}
          <div style={{ background: '#f4f4f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
            <h3>Issue Book to Member</h3>
            <form onSubmit={handleIssueBook} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={{ padding: '8px', flex: '1', minWidth: '180px' }}>
                <option value="">-- Select Member --</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>
                ))}
              </select>

              <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} style={{ padding: '8px', flex: '1', minWidth: '180px' }}>
                <option value="">-- Select Book --</option>
                {books.filter(b => b.available_copies > 0).map(b => (
                  <option key={b.book_id} value={b.book_id}>{b.title} ({b.available_copies} avail)</option>
                ))}
              </select>

              <input type="number" min="1" max="60" value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ padding: '8px', width: '70px' }} title="Days" />

              <button type="submit" disabled={loading} style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? 'Processing...' : 'Issue Book'}
              </button>
            </form>
          </div>

          {/* Borrowings Table */}
          <h3>Active & Past Borrowing Transactions</h3>
          <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#e4e4e7' }}>
                <th>ID</th>
                <th>Member</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {borrowings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>No borrowings recorded.</td>
                </tr>
              ) : (
                borrowings.map((br) => (
                  <tr key={br.borrow_id}>
                    <td>{br.borrow_id}</td>
                    <td>{br.user_name}</td>
                    <td>{br.book_title}</td>
                    <td>{br.issue_date}</td>
                    <td>{br.due_date}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        background: br.status === 'BORROWED' ? '#fef3c7' : '#dcfce7',
                        color: br.status === 'BORROWED' ? '#92400e' : '#166534'
                      }}>
                        {br.status}
                      </span>
                    </td>
                    <td>${Number(br.fine).toFixed(2)}</td>
                    <td>
                      {br.status === 'BORROWED' && (
                        <button onClick={() => handleReturnBook(br.borrow_id)} style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* BOOKS & USERS TABS OMITTED FOR BREVITY BUT CAN REMAIN AS BEFORE */}
      {activeTab === 'books' && (
        <div>
          <h3>Book Inventory</h3>
          <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e4e4e7' }}>
                <th>ID</th><th>Title</th><th>ISBN</th><th>Total</th><th>Available</th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b.book_id}>
                  <td>{b.book_id}</td><td>{b.title}</td><td>{b.isbn}</td><td>{b.total_copies}</td><td>{b.available_copies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3>Registered Members</h3>
          <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e4e4e7' }}>
                <th>ID</th><th>Name</th><th>Email</th><th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}