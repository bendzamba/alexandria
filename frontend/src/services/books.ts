import { Base } from "./base";
import {
  BookWithBookshelvesInterface,
  CreateOrUpdateBookInterface,
} from "../interfaces/book_and_bookshelf";
import { WorkInterface } from "../interfaces/work";

export const GetBooks = async (): Promise<
  BookWithBookshelvesInterface[] | boolean
> => {
  return await Base("/books/");
};

export const CreateBook = async (
  data: Partial<CreateOrUpdateBookInterface>
): Promise<boolean> => {
  return await Base("/books/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const GetBook = async (
  id: number
): Promise<BookWithBookshelvesInterface | boolean> => {
  return await Base(`/books/${id}`);
};

export const UpdateBook = async (
  id: number,
  data: Partial<CreateOrUpdateBookInterface>
): Promise<boolean> => {
  return await Base(`/books/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const DeleteBook = async (id: number): Promise<boolean> => {
  return await Base(`/books/${id}`, {
    method: "DELETE",
  });
};

export const BulkDeleteBooks = async (book_ids: number[]): Promise<boolean> => {
  return await Base(`/books/bulk`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ book_ids: book_ids }),
  });
};

export const SearchBookByTitle = async (
  title: string
): Promise<WorkInterface[] | boolean> => {
  return await Base(`/books/search/${title}`);
};
