import { setupServer } from "msw/node";
import { bookshelfHandlers, bookHandlers } from "./handlers";

export const server = setupServer(...bookshelfHandlers, ...bookHandlers);
