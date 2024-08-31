import { toast } from "react-toastify";

export const Base = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T | boolean> => {
  try {
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
