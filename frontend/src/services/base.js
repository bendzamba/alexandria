export const Base = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    // Check if the response status is not OK
    if (!response.ok) {
      // Handle specific HTTP status codes as needed
      if (response.status === 500) {
        throw new Error("Server error: " + response.statusText);
      } else {
        // This would catch 4xx
        throw new Error("HTTP error: " + response.statusText);
      }
    }

    if ([201, 204].includes(response.status)) {
      // There shouldn't be a response body here, even though response.json() might not error
      // due to response headers indicating application/json as a Content-Type
      return true;
    }

    // Assuming the response is JSON
    return await response.json();
  } catch (error) {
    // Currently only logging error, not displaying anything to user
    console.error("Fetch error:", error);
    return false;
  }
};
