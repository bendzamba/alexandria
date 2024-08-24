import { Base } from "./base";
const API_BASE_URL = "http://127.0.0.1:8000";

export const GetBooks = async () => {
  return await Base(`${API_BASE_URL}/books/`);
};

export const CreateBook = async (data) => {
  return await Base(`${API_BASE_URL}/books/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const GetBook = async (id) => {
  return await Base(`${API_BASE_URL}/books/${id}`);
};

export const UpdateBook = async (id, data) => {
  return await Base(`${API_BASE_URL}/books/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const DeleteBook = async (id) => {
  return await Base(`${API_BASE_URL}/books/${id}`, {
    method: "DELETE",
  });
};

export const SearchBookByTitle = async (title) => {
  return await Base(`${API_BASE_URL}/books/search/${title}`);
};
