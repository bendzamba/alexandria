import { toast } from "react-toastify";
import { fetchAuthSession } from "@aws-amplify/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const Base = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T | boolean> => {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  if (!options.headers) {
    options.headers = {};
  }

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const url = API_BASE_URL + path;
    const response = await fetch(url, options);

    // Check if the response status is not OK
    if (!response.ok) {
      const response_json = await response.json();
      let response_message = "An unknown error has occurred";
      if ("detail" in response_json) {
        response_message = response_json["detail"];
      }
      if (response.status >= 400 && response.status <= 599) {
        throw new Error(response_message);
      }
    }

    if ([201, 204].includes(response.status)) {
      // There shouldn't be a response body here, even though response.json() might not error
      // due to response headers indicating application/json as a Content-Type
      return true;
    }

    // Assuming the response is JSON
    const data: T = (await response.json()) as T;
    return data;
  } catch (e: unknown) {
    let error_message = "";
    if (typeof e === "string") {
      error_message = e.toUpperCase();
    } else if (e instanceof Error) {
      error_message = e.message;
    }
    console.error("Fetch error:", error_message);
    toast.error(error_message, {
      position: "bottom-right",
      theme: "colored",
    });
    return false;
  }
};
