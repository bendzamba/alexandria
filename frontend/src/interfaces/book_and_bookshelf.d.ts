export interface BookInterface {
  id: number;
  title: string;
  author: string;
  year: number;
  olid: string;
  cover_uri: string;
  olids: string;
  rating: number;
  review: string;
}

export interface BookWithBookshelvesInterface extends BookInterface {
  bookshelves: BookshelfInterface[];
}

export interface CreateOrUpdateBookInterface {
  title: string;
  author: string;
  year: number;
  olid: string;
  cover_uri: string;
  olids: string;
  rating: number;
  review: string;
}

export interface BookshelfInterface {
  id: number;
  title: string;
  description: string;
}

export interface BookshelfWithBooksInterface extends BookshelfInterface {
  books: BookInterface[];
}

export interface CreateOrUpdateBookshelfInterface {
  title: string;
  description: string;
}
