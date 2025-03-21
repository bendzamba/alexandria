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
  const options: RequestInit = {
    method: "POST",
  };
  if (data?.upload) {
    // Use FormData when a file is provided
    const formData = new FormData();
    for (const key in data) {
      // Skip cover upload as that is added as a 'file' below
      if (key !== "upload") {
        formData.append(
          key,
          data[key as keyof CreateOrUpdateBookInterface] as string
        );
      }
    }
    formData.append("file", data.upload);
    options.body = formData;
  } else {
    // Use JSON if no file is provided
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }
  return await Base("/books/", options);
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
  const options: RequestInit = {
    method: "PATCH",
  };
  if (data?.upload) {
    // Use FormData when a file is provided
    const formData = new FormData();
    for (const key in data) {
      // Skip cover upload as that is added as a 'file' below
      if (key !== "image") {
        formData.append(
          key,
          data[key as keyof CreateOrUpdateBookInterface] as string
        );
      }
    }
    formData.append("file", data.upload);
    options.body = formData;
  } else {
    // Use JSON if no file is provided
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }
  return await Base(`/books/${id}`, options);
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
