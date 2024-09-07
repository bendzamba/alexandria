import { http, HttpResponse } from "msw";
import dotenv from "dotenv";
import { BookWithBookshelvesInterface } from "../../interfaces/book_and_bookshelf";
dotenv.config({ path: ".env.development" });

export const bookshelfHandlers = [
  // Example: Mock GET request to fetch bookshelves
  http.get(`${process.env.REACT_APP_API_URL}/bookshelves/`, () => {
    return HttpResponse.json([
      {
        id: 1,
        title: "My First Bookshelf",
        description: "A nice bookshelf.",
        sort_key: "title",
        sort_direction: "ascending",
      },
      {
        id: 2,
        title: "Favorite Bookshelf",
        description: "Holds my favorite books.",
        sort_key: "title",
        sort_direction: "ascending",
      },
    ]);
  }),

  http.get(`${process.env.REACT_APP_API_URL}/bookshelves/1`, () => {
    return HttpResponse.json({
      id: 1,
      title: "My First Bookshelf",
      description: "A nice bookshelf.",
      sort_key: "title",
      sort_direction: "ascending",
      books: [],
    });
  }),

  http.get(`${process.env.REACT_APP_API_URL}/bookshelves/2`, () => {
    return HttpResponse.json({
      id: 2,
      title: "Favorite Bookshelf",
      description: "Holds my favorite books.",
      sort_key: "title",
      sort_direction: "ascending",
      books: [],
    });
  }),
];

export const bookHandlers = [
  // Example: Mock GET request to fetch books
  http.get(`${process.env.REACT_APP_API_URL}/books/`, () => {
    const response: BookWithBookshelvesInterface[] = [
      {
        id: 1,
        title: "The Grapes of Wrath",
        author: "John Steinbeck",
        year: 1939,
        olid: "OL14994208M",
        olids: '["OL37811454M","OL46855753M","OL13890061M","OL7641090M"]',
        cover_uri: "/images/OL14994208M.jpg",
        read_status: "read",
        read_start_date: "2022-02-13T05:00:00.000Z",
        read_end_date: "2022-02-21T05:00:00.000Z",
        rating: 5,
        review: "I liked it!",
      },
      {
        id: 2,
        title: "Crime and Punishment",
        author: "Fyodor Dostoevsky",
        year: 1866,
        olid: "OL33031858M",
        olids: '["OL32588103M", "OL34712585M", "OL34670198M"]',
        cover_uri: "/images/OL33031858M.jpg",
        read_status: "read",
        read_start_date: "2023-04-13T05:00:00.000Z",
        read_end_date: "2023-04-21T05:00:00.000Z",
        rating: 4,
        review: "Nyet!",
      },
    ];
    return HttpResponse.json(response);
  }),

  http.get(`${process.env.REACT_APP_API_URL}/books/1`, () => {
    const response: BookWithBookshelvesInterface = {
      id: 1,
      title: "The Grapes of Wrath",
      author: "John Steinbeck",
      year: 1939,
      olid: "OL14994208M",
      olids: '["OL37811454M","OL46855753M","OL13890061M","OL7641090M"]',
      cover_uri: "/images/OL14994208M.jpg",
      read_status: "read",
      read_start_date: "2022-02-13T05:00:00.000Z",
      read_end_date: "2022-02-21T05:00:00.000Z",
      rating: 5,
      review: "I liked it!",
      bookshelves: [],
    };
    return HttpResponse.json(response);
  }),

  http.get(`${process.env.REACT_APP_API_URL}/books/2`, () => {
    const response = {
      id: 2,
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      year: 1866,
      olid: "OL33031858M",
      olids: '["OL32588103M", "OL34712585M", "OL34670198M"]',
      cover_uri: "/images/OL33031858M.jpg",
      read_status: "read",
      read_start_date: "2023-04-13T05:00:00.000Z",
      read_end_date: "2023-04-21T05:00:00.000Z",
      rating: 4,
      review: "Nyet!",
      bookshelves: [],
    };
    return HttpResponse.json(response);
  }),

  http.patch(`${process.env.REACT_APP_API_URL}/books/1`, () => {
    return HttpResponse.json("");
  }),

  http.delete(`${process.env.REACT_APP_API_URL}/books/1`, () => {
    return HttpResponse.json("");
  }),
];
