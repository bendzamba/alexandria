export interface BookInterface {
  id: number;
  title: string;
  author: string;
  year: number;
  image: CoverImageInterface;
  olids: string;
  rating: number | null;
  review: string | null;
  read_status: string;
  read_start_date: string | null;
  read_end_date: string | null;
}

export interface BookWithBookshelvesInterface extends BookInterface {
  bookshelves?: BookshelfInterface[];
}

export interface SortableBookProperties {
  id: number;
  title: string;
  author: string;
  year: number;
  rating: number | null;
  read_end_date: string | null;
}

export interface CreateOrUpdateBookInterface {
  title: string;
  author: string;
  year: number;
  olids: string;
  rating: number | null;
  review: string | null;
  read_status: string;
  read_start_date: string | null;
  read_end_date: string | null;
  olid: string | null;
  upload: File | null;
  // image: NewCoverImageInterface;
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

// This is the interface describing images returned from the API belonging to books
export interface CoverImageInterface {
  id: number;
  source: string;
  source_id: string;
  extension: string;
  uri: string;
}

enum CoverImageType {
  olid = "olid",
  file = "file",
}

// This is the interface for available cover images to select
export interface AvailableCoverImageInterface {
  unique_id?: string | null;
  type: CoverImageType;
  upload?: File | null;
  uri?: string;
  thumb_uri?: string;
}
