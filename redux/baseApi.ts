import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { getSecureToken } from "../utils/secureStorage";
import ENV from "../env";
// Create a base GraphQL query configuration to be reused by all API slices
export const baseGraphQLQuery = graphqlRequestBaseQuery({
  url: ENV.API_URL,
  prepareHeaders: async (headers) => {
    // Get the token from secure storage
    const token = await getSecureToken();

    // If we have a token, add it to the headers
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
  customErrors: (error) => {
    // Handle specific GraphQL error types
    if (error.name === "ServerError" && error.response?.status === 401) {
      return { message: "Authentication error: Please sign in again", status: 401 };
    }

    if (error.name === "ServerError" && error.response?.status === 403) {
      return { message: "Authorization error: You don't have permission to access this resource", status: 403 };
    }

    if (error.name === "ServerError" && error.response?.status >= 500) {
      return { message: "Server error: The server is currently unavailable. Please try again later.", status: error.response.status };
    }

    if (error.name === "FetchError") {
      return { message: "Network error: Please check your internet connection", status: 0 };
    }

    // Default error message
    return { message: error.message || "An unknown error occurred", status: error.response?.status || 0 };
  },
});
