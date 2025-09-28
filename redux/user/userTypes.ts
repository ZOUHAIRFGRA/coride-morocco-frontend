// Full User Profile response type
export interface UserProfile {
  id: string;
  lastLogin?: string;
  email: string;
  isActive: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  isVerified: boolean;
  notificationIsOn: boolean;
  localizationIsOn: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  country?: string;
  userBio?: string;
  profileImage?: string;
  privateKey?: string;
  password?: string;
  dateJoined: string;
  isPremium: boolean;
  premiumSince?: string;
  handle?: string;
  clientMutationId?: string;
  // otherNames?: string;
  chatId?: string;
  userUuid?: string;
  language?: {
    code: string;
    name: string;
    sortOrder: number;
  };
}

export interface UserProfileResponse {
  user: UserProfile;
}

// Input type for updating user profile
export interface UpdateUserInput {
  clientMutationId?: string;
  profileImage?: string;
  firstName?: string;
  lastName?: string;
  handle?: string;
  email?: string;
  phone?: string;
  language?: string;
  country?: string;
  // otherNames: string;
}

// Response type for update user mutation
export interface UpdateUserResponse {
  internalId: string;
  success: boolean;
  message: string;
  clientMutationId?: string;
}
