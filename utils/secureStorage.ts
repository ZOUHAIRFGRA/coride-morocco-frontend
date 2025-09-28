import * as SecureStore from "expo-secure-store";
// Keys for storing tokens
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const LAST_SECTION_KEY = "lastAppSection";

/**
 * Securely stores access and refresh tokens using expo-secure-store
 */
export const setSecureTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error("Error storing secure tokens:", error);
    throw error;
  }
};

/**
 * For backward compatibility with existing code
 */
export const setSecureToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing secure token:", error);
    throw error;
  }
};

/**
 * Retrieves a securely stored access token
 * Returns null if no token is found or if an error occurs
 */
export const getSecureToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Error retrieving secure token:", error);
    return null;
  }
};

/**
 * Retrieves a securely stored refresh token
 * Returns null if no token is found or if an error occurs
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

/**
 * Removes all securely stored tokens
 */
export const removeSecureToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(LAST_SECTION_KEY);
  } catch (error) {
    console.error("Error removing secure tokens:", error);
    throw error;
  }
};

/**
 * Saves the last app section visited by the user
 * @param section - The section path (e.g. "/investment/(tabs)/investment")
 */
export const saveLastAppSection = async (section: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(LAST_SECTION_KEY, section);
  } catch (error) {
    console.error("Error saving last app section:", error);
  }
};

/**
 * Gets the last app section visited by the user
 * @returns The saved section path or null if not found
 */
export const getLastAppSection = async (): Promise<string | null> => {
  try {
    const section = await SecureStore.getItemAsync(LAST_SECTION_KEY);
    return section;
  } catch (error) {
    console.error("Error getting last app section:", error);
    return null;
  }
};

async function clearSecureStore() {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(LAST_SECTION_KEY);
  } catch (error) {
    console.error("Error clearing secure store:", error);
  }
}

// clearSecureStore();

async function addDevToken() {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, "dev-token");
  } catch (error) {
    console.error("Error adding dev token:", error);
  }
}

// addDevToken();

// const redirectUri = AuthSession.makeRedirectUri({});
// console.log(redirectUri); // Logs the correct redirect URI
