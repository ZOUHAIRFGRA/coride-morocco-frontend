// Auth input types
export interface OtpInput {
  email: string;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  handle: string;
  email: string;
  // otherNames?: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

// Auth response types
export interface OtpResponse {
  internalId: string;
  success: boolean;
  message: string;
  clientMutationId: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpDataResponse {
  tokenAuth: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  user: {
    id: string | null;
    email: string;
    firstName: string;
    lastName: string;
    chatId?: string;
    city?: string;
    country?: string;
    dateJoined?: string;
    handle?: string;
    isActive?: boolean;
    isPremium?: boolean;
    isStaff?: boolean;
    isSuperuser?: boolean;
    isVerified?: boolean;
    language?: {
      code: string;
      name: string;
      sortOrder: number;
    };
    lastLogin?: string;
    localizationIsOn?: boolean;
    notificationIsOn?: boolean;
    // otherNames?: string;
    phone?: string;
    premiumSince?: string;
    profileImage?: string;
    state?: string;
    streetAddress?: string;
    userBio?: string;
    zipCode?: string;
  };
  success: boolean;
  message: string;
  clientMutationId: string;
}

export interface RefreshTokenResponse {
  token: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  success: boolean;
  message: string;
  clientMutationId: string;
}

// Auth state type - simplified to only contain authentication-related information
export interface AuthState {
  user: {
    id: string | null;
    email: string;
  };
  token: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  isAuthenticated: boolean;
}
