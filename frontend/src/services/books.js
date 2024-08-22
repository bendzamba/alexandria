const API_BASE_URL = 'http://127.0.0.1:8000';

export const GetBooks = async () => {
    const response = await fetch(`${API_BASE_URL}/books/`);
    return await response.json();
  };
  
export const CreateBook = async (data) => {
    const response = await fetch(`${API_BASE_URL}/books/`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export const GetBook = async (id) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    return await response.json();
};

export const UpdateBook = async (id, data) => {
    return await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export const DeleteBook = async (id) => {
    await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
    });
}

export const SearchBookByTitle = async (title) => {
    const response = await fetch(`${API_BASE_URL}/books/search/${title}`)
    return await response.json();
};