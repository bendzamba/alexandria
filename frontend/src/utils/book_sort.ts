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

const titleSort: SortFunction<string> = (title: string) => {
  const articlesToIgnore = ["the", "a", "an"];
  const lowerCaseTitle = title.toLowerCase();
  const titleSplit = lowerCaseTitle.split(" ");
  if (articlesToIgnore.includes(titleSplit[0])) {
    return titleSplit.slice(1).join(" ");
  }
  return lowerCaseTitle;
};

const sortFunctions: {
  author: SortFunction<string>;
  read_end_date: SortFunction<string>;
  title: SortFunction<string>;
} = {
  author: surnameSort,
  read_end_date: dateSort,
  title: titleSort,
};

const mapValueToSortable = (
  key: string,
  value: string | number | null,
  book: BookWithBookshelvesInterface
) => {
  if (value === null) {
    // null values do not need to be mapped in order to sort
    return value;
  }
  if (typeof value === "number") {
    // numbers do not need to be mapped in order to sort
    return value;
  }
  // We've defined no specific sorting function for the value
  if (!(key in sortFunctions)) {
    return value;
  }
  return sortFunctions[key as keyof typeof sortFunctions](value, book);
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
  let bookAMappedValue = mapValueToSortable(sortKey, bookA[sortKey], bookA);
  let bookAComparison = bookAMappedValue ? bookAMappedValue : nullPosition;
  let bookBMappedValue = mapValueToSortable(sortKey, bookB[sortKey], bookB);
  let bookBComparison = bookBMappedValue ? bookBMappedValue : nullPosition;

  // If A and B are equal, we need to consider a secondary sort, to sort within the
  // equal values. Default to `title` as secondary, unless title is the same, in which
  // case default to `author` as secondary.
  if (bookAComparison === bookBComparison) {
    let secondarySortKey: keyof SortableBookProperties = "title";
    if (sortKey === "title") {
      secondarySortKey = "author";
    }
    bookAMappedValue = mapValueToSortable(
      secondarySortKey,
      bookA[secondarySortKey],
      bookA
    );
    bookAComparison = bookAMappedValue ? bookAMappedValue : nullPosition;
    bookBMappedValue = mapValueToSortable(
      secondarySortKey,
      bookB[secondarySortKey],
      bookB
    );
    bookBComparison = bookBMappedValue ? bookBMappedValue : nullPosition;
  }

  if (bookAComparison < bookBComparison) {
    return -1 * directionModifier;
  } else if (bookAComparison > bookBComparison) {
    return 1 * directionModifier;
  }

  /* 
  Being still equal at this point seems like an edge case.
  It would mean that both `rating|date added|reading dates|year` PLUS
  title are equal, which means two books with identical titles exist,
  AND have the same comparison value the user has selected. Possible
  but unlikely. OR it means that two books exist with the same title 
  AND author, which is surely an error on the user's part.
  */
  return 0;
};
