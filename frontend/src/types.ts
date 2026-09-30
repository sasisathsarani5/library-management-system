export interface Book {
  book_id?: number;
  title: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
}

export interface User {
  user_id?: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  created_at?: string;
}

export interface Borrowing {
  borrow_id: number;
  user_name: string;
  book_title: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'BORROWED' | 'RETURNED';
  fine: number;
}