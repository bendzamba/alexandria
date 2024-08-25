import { Base } from "./base";
import { CreateOrUpdateBookInterface } from "../interfaces/book_and_bookshelf";
const API_BASE_URL = "http://127.0.0.1:8000";

export const GetBooks = async () => {
  return await Base(`${API_BASE_URL}/books/`);
};

export const CreateBook = async (data: Partial<CreateOrUpdateBookInterface>) => {
  return await Base(`${API_BASE_URL}/books/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const GetBook = async (id: number) => {
  return await Base(`${API_BASE_URL}/books/${id}`);
};

export const UpdateBook = async (id: number, data: Partial<CreateOrUpdateBookInterface>) => {
  return await Base(`${API_BASE_URL}/books/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const DeleteBook = async (id: number) => {
  return await Base(`${API_BASE_URL}/books/${id}`, {
    method: "DELETE",
  });
};

export const SearchBookByTitle = async (title: string) => {
  return await Base(`${API_BASE_URL}/books/search/${title}`);
};
