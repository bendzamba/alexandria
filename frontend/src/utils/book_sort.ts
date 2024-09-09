import {
  BookWithBookshelvesInterface,
  SortableBookProperties,
} from "../interfaces/book_and_bookshelf";

type SortFunction<T> = {
  (value: T, book: BookWithBookshelvesInterface): string | Date | null;
  (value: T): string | Date | null;
};

const surnameSort: SortFunction<string> = (author_name: string) => {
  /* 
  There may be a more intelligent way of handling this, such as procuring
  proper, semantic `first` and `last` names for each Author. In lieu of
  that, we attempt to determine whether or not their `double-barrelled` surname
  should be preserved for sorting.
  Example:
  Ursula K. Le Guin should be sorted by L, not G
  Guy de Maupassant should be sorted by M, not D
  */

  const nameParts = author_name.split(" ");

  // List of integral prefixes (part of surname)
  const integralPrefixes = ["le", "la", "de la"];

  // List of common surname prefixes to ignore
  const ignorePrefixes = [
    "van",
    "von",
    "de",
    "del",
    "di",
    "da",
    "al",
    "bin",
    "mc",
    "mac",
    "ibn",
  ];

  // Start by assuming the last name is the surname
  let surname = nameParts[nameParts.length - 1];

  // Check if the name includes an integral prefix
  for (let i = nameParts.length - 1; i > 0; i--) {
    const potentialPrefix = nameParts[i - 1].toLowerCase();
    const fullSurnameCandidate = nameParts.slice(i - 1).join(" ");

    // If the prefix is part of the surname (e.g., "Le Guin")
    if (integralPrefixes.includes(potentialPrefix)) {
      surname = fullSurnameCandidate;
      break;
    }

    // If we find an ignorable prefix, we stop and return the next part as surname
    else if (ignorePrefixes.includes(potentialPrefix)) {
      surname = nameParts[i];
      break;
    }
  }

  return surname.toLowerCase();
};

const dateSort: SortFunction<string> = (
  read_end_date_string: string | null,
  book?: BookWithBookshelvesInterface
) => {
  if (book === undefined) {
    console.log("Can't sort by date as book is undefined");
    return null;
  }
  // If there is a start date, but no end date, the end
  // should be "today" for proper sorting
  if (!read_end_date_string) {
    if (book.read_start_date) {
      return new Date();
    }
    return null;
  }
  return new Date(read_end_date_string);
};

const sortFunctions: Record<string, SortFunction<any>> = {
  author: surnameSort as SortFunction<string>,
  read_end_date: dateSort as SortFunction<string>,
};

const mapValueToSortable = (
  key: string,
  value: string | number | null,
  book: BookWithBookshelvesInterface
) => {
  // We've defined no specific sorting function for the value
  if (!(key in sortFunctions)) {
    return value;
  }
  return sortFunctions[key](value, book);
};

export const bookSort = (
  bookA: BookWithBookshelvesInterface,
  bookB: BookWithBookshelvesInterface,
  sortKey: keyof SortableBookProperties,
  sortDirection: string
) => {
  const directionModifier = sortDirection === "ascending" ? 1 : -1;
  if (bookA[sortKey] === undefined || bookB[sortKey] === undefined) {
    return 0;
  }
  // If the value is null, we essentially remove it from the
  // order by placing it at the very end with either 0 or Infinity
  // depending on sort direction
  let nullPosition = Infinity;
  if (directionModifier === -1) {
    nullPosition = 0;
  }
  const bookAMappedValue = mapValueToSortable(sortKey, bookA[sortKey], bookA);
  const bookAComparison = bookAMappedValue ? bookAMappedValue : nullPosition;
  const bookBMappedValue = mapValueToSortable(sortKey, bookB[sortKey], bookB);
  const bookBComparison = bookBMappedValue ? bookBMappedValue : nullPosition;
  if (bookAComparison < bookBComparison) {
    return -1 * directionModifier;
  } else if (bookAComparison > bookBComparison) {
    return 1 * directionModifier;
  }
  // A and B are equal
  return 0;
};
