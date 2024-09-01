export interface BookInterface {
  id: number;
  title: string;
  author: string;
  year: number;
  olid: string;
  cover_uri: string;
  olids: string;
  rating: number | null;
  review: string;
  read_status: string;
  read_start_date: string;
  read_end_date: string;
}

export interface BookWithBookshelvesInterface extends BookInterface {
  bookshelves?: BookshelfInterface[];
}

export interface CreateOrUpdateBookInterface {
  title: string;
  author: string;
  year: number;
  olid: string;
  cover_uri: string;
  olids: string;
  rating: number | null;
  review: string;
  read_status: string;
  read_start_date: string | null;
  read_end_date: string | null;
}

export interface BookshelfInterface {
  id: number;
  title: string;
  description: string;
  sort_key: string;
  sort_direction: string;
}

export interface BookshelfWithBooksInterface extends BookshelfInterface {
  books: BookInterface[];
}

export interface CreateOrUpdateBookshelfInterface {
  title: string;
  description: string;
  sort_key: string;
  sort_direction: string;
}
