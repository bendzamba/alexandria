const API_BASE_URL = 'http://127.0.0.1:8000';

export const GetBookshelves = async () => {
  const response = await fetch(`${API_BASE_URL}/bookshelves/`);
  return await response.json();
};

export const CreateBookshelf = async (data) => {
  const response = await fetch(`${API_BASE_URL}/bookshelves/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

export const GetBookshelf = async (id) => {
  const response = await fetch(`${API_BASE_URL}/bookshelves/${id}`);
  return await response.json();
};

export const UpdateBookshelf = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/bookshelves/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

export const DeleteBookshelf = async (id) => {
  await fetch(`${API_BASE_URL}/bookshelves/${id}/`, {
    method: 'DELETE',
  });
}

export const GetBookshelfBooks = async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookshelves/${id}/books`);
    return await response.json();
  };

export const AddBookToBookshelf = async (bookshelfId, bookId) => {
  const response = await fetch(`${API_BASE_URL}/bookshelves/${bookshelfId}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 'book_id': bookId }),
  });
  return await response.json();
};

export const DeleteBookFromBookshelf = async (bookshelfId, bookId) => {
  await fetch(`${API_BASE_URL}/bookshelves/${bookshelfId}/books/${bookId}`, {
    method: 'DELETE',
  });
}