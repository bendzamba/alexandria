import { http, HttpResponse } from "msw";
import dotenv from "dotenv";
import {
  BookWithBookshelvesInterface,
  BookshelfWithBooksInterface,
  BookshelfInterface,
  BookInterface,
} from "../../interfaces/book_and_bookshelf";
import { WorkInterface } from "../../interfaces/work";
dotenv.config({ path: ".env.development" });

export const bookshelfHandlers = [
  // Example: Mock GET request to fetch bookshelves
  http.get(`${process.env.REACT_APP_API_URL}/bookshelves/`, () => {
    const response: BookshelfInterface[] = [
      {
        id: 1,
        title: "The Great American Novel",
        description: "Books that capture the essence of America",
        sort_key: "title",
        sort_direction: "ascending",
      },
      {
        id: 2,
        title: "Science Fiction Classics",
        description: "Masters of speculation",
        sort_key: "title",
        sort_direction: "ascending",
      },
    ];
    return HttpResponse.json(response);
  }),

  http.get(`${process.env.REACT_APP_API_URL}/bookshelves/1`, () => {
    const response: BookshelfWithBooksInterface = {
      id: 1,
      title: "The Great American Novel",
      description: "Books that capture the essence of America",
      sort_key: "title",
      sort_direction: "ascending",
      books: [
        {
          id: 1,
          title: "Lonesome Dove",
          author: "Larry McMurtry",
          year: 1985,
          olids: '["OL7660473M","OL12086552M", "OL26296459M", "OL28267018M"]',
          read_status: "read",
          read_start_date: "2023-06-11T05:00:00.000Z",
          read_end_date: "2023-07-09T05:00:00.000Z",
          rating: 5,
          review:
            "All America lies at the end of the wilderness road, and our past is not a dead past, but still lives in us.",
          image: {
            id: 1,
            source: "open_library",
            source_id: "OL7660473M",
            uri: "/images/OL7660473M.jpg",
            extension: ".jpg",
          },
        },
      ],
    };
    return HttpResponse.json(response);
  }),

  http.get(`${process.env.REACT_APP_API_URL}/bookshelves/2`, () => {
    const response: BookshelfWithBooksInterface = {
      id: 2,
      title: "Science Fiction Classics",
      description: "Masters of speculation",
      sort_key: "title",
      sort_direction: "ascending",
      books: [
        {
          id: 2,
          title: "The Left Hand of Darkness",
          author: "Ursula K. Le Guin",
          year: 1962,
          olids: '["OL7893085M","OL50179038M", "OL32576277M", "OL27289471M"]',
          read_status: "read",
          read_start_date: "2021-01-22T05:00:00.000Z",
          read_end_date: "2021-02-12T05:00:00.000Z",
          rating: 5,
          review:
            "Light, dark. Fear, courage. Cold, warmth. Female, male. It is yourself, Therem. Both and one. A shadow on the snow.",
          image: {
            id: 1,
            source: "open_library",
            source_id: "OL7893085M",
            uri: "/images/OL7893085M.jpg",
            extension: ".jpg",
          },
        },
      ],
    };
    return HttpResponse.json(response);
  }),

  http.get(
    `${process.env.REACT_APP_API_URL}/bookshelves/1/books/exclude/`,
    () => {
      const response: BookInterface[] = [
        {
          id: 3,
          title: "The Grapes of Wrath",
          author: "John Steinbeck",
          year: 1939,
          olids: '["OL37811454M","OL46855753M","OL13890061M","OL7641090M"]',
          read_status: "read",
          read_start_date: "2022-02-13T05:00:00.000Z",
          read_end_date: "2022-02-21T05:00:00.000Z",
          rating: 5,
          review: "I liked it!",
          image: {
            id: 1,
            source: "open_library",
            source_id: "OL14994208M",
            uri: "/images/OL14994208M.jpg",
            extension: ".jpg",
          },
        },
      ];
      return HttpResponse.json(response);
    }
  ),

  http.post(`${process.env.REACT_APP_API_URL}/bookshelves/`, () => {
    return HttpResponse.json("");
  }),

  http.patch(`${process.env.REACT_APP_API_URL}/bookshelves/1`, () => {
    return HttpResponse.json("");
  }),

  http.post(`${process.env.REACT_APP_API_URL}/bookshelves/1/books/`, () => {
    return HttpResponse.json("");
  }),

  http.delete(`${process.env.REACT_APP_API_URL}/bookshelves/1/books/1`, () => {
    return HttpResponse.json("");
  }),

  http.delete(`${process.env.REACT_APP_API_URL}/bookshelves/1`, () => {
    return HttpResponse.json("");
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
        olids: '["OL37811454M","OL46855753M","OL13890061M","OL7641090M"]',
        read_status: "read",
        read_start_date: "2022-02-13T05:00:00.000Z",
        read_end_date: "2022-02-21T05:00:00.000Z",
        rating: 5,
        review: "I liked it!",
        image: {
          id: 1,
          source: "open_library",
          source_id: "OL14994208M",
          uri: "/images/OL14994208M.jpg",
          extension: ".jpg",
        },
      },
      {
        id: 2,
        title: "Crime and Punishment",
        author: "Fyodor Dostoevsky",
        year: 1866,
        olids: '["OL32588103M", "OL34712585M", "OL34670198M"]',
        read_status: "read",
        read_start_date: "2023-04-13T05:00:00.000Z",
        read_end_date: "2023-04-21T05:00:00.000Z",
        rating: 4,
        review: "Nyet!",
        image: {
          id: 1,
          source: "open_library",
          source_id: "OL33031858M",
          uri: "/images/OL33031858M.jpg",
          extension: ".jpg",
        },
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
      olids: '["OL37811454M","OL46855753M","OL13890061M","OL7641090M"]',
      read_status: "read",
      read_start_date: "2022-02-13T05:00:00.000Z",
      read_end_date: "2022-02-21T05:00:00.000Z",
      rating: 5,
      review: "I liked it!",
      bookshelves: [],
      image: {
        id: 1,
        source: "open_library",
        source_id: "OL14994208M",
        uri: "/images/OL14994208M.jpg",
        extension: ".jpg",
      },
    };
    return HttpResponse.json(response);
  }),

  http.get(`${process.env.REACT_APP_API_URL}/books/2`, () => {
    const response: BookWithBookshelvesInterface = {
      id: 2,
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      year: 1866,
      olids: '["OL32588103M", "OL34712585M", "OL34670198M"]',
      read_status: "read",
      read_start_date: "2023-04-13T05:00:00.000Z",
      read_end_date: "2023-04-21T05:00:00.000Z",
      rating: 4,
      review: "Nyet!",
      bookshelves: [],
      image: {
        id: 1,
        source: "open_library",
        source_id: "OL33031858M",
        uri: "/images/OL33031858M.jpg",
        extension: ".jpg",
      },
    };
    return HttpResponse.json(response);
  }),

  http.patch(`${process.env.REACT_APP_API_URL}/books/1`, () => {
    return HttpResponse.json("");
  }),

  http.delete(`${process.env.REACT_APP_API_URL}/books/1`, () => {
    return HttpResponse.json("");
  }),

  http.delete(`${process.env.REACT_APP_API_URL}/books/bulk`, () => {
    return HttpResponse.json("");
  }),

  http.get(
    `${process.env.REACT_APP_API_URL}/books/search/Farewell%20to%20Arms`,
    () => {
      const response: WorkInterface[] = [
        {
          title: "A Farewell to Arms",
          author_name: "Ernest Hemingway",
          first_publish_year: 1929,
          olids: ["OL24206828M", "OL32992800M", "OL32596124M"],
        },
        {
          title: "An Armful of Farewells",
          author_name: "Errol Wellinghay",
          first_publish_year: 1931,
          olids: ["OL24206821M", "OL32992801M", "OL32596121M"],
        },
      ];
      return HttpResponse.json(response);
    }
  ),

  http.get(
    `${process.env.REACT_APP_API_URL}/books/search/Tale%20of%20Two%20Cities`,
    () => {
      const response: WorkInterface[] = [
        {
          title: "A Tale of Two Cities",
          author_name: "Charles Dickens",
          first_publish_year: 1859,
          olids: ["OL52151281M", "OL51503229M", "OL46911647M"],
        },
      ];
      return HttpResponse.json(response);
    }
  ),

  http.get(`${process.env.REACT_APP_API_URL}/books/search/Potrzebie!`, () => {
    const response: WorkInterface[] = [];
    return HttpResponse.json(response);
  }),

  http.post(`${process.env.REACT_APP_API_URL}/books/`, () => {
    return HttpResponse.json("");
  }),
];
