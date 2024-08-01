const API_BASE_URL = 'http://127.0.0.1:8000';

export const GetBookshelves = async () => {
  const response = await fetch(`${API_BASE_URL}/bookshelves/`);
  let response_json = await response.json();
  return response_json;
};

export const GetBookshelfBooks = async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookshelves/${id}/books`);
    return await response.json();
  };

export const getBookshelf = async (id) => {
  const response = await fetch(`${API_BASE_URL}/bookshelves/${id}`);
  return response.json();
};

export const addBookToBookshelf = async (bookshelfId, bookId) => {
  const response = await fetch(`${API_BASE_URL}/bookshelves/${bookshelfId}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookId }),
  });
  return response.json();
};
